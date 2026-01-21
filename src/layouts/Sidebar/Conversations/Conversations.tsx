'use client'

import { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import Skeleton from 'react-loading-skeleton'
import Image from 'next/image'
import useSWR from 'swr'

import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ConversationItem from '~/components/ConversationItem'
import { SocketEvent } from '~/enum/SocketEvent'
import SWRKey from '~/enum/SWRKey'
import { listenEvent } from '~/helpers/events'
import handleApiError from '~/helpers/handleApiError'
import socket from '~/helpers/socket'
import { useAppSelector } from '~/redux'
import { getCurrentTheme } from '~/redux/selector'
import * as conversationService from '~/services/conversationService'
import {
    ConversationMember,
    ConversationModel,
    ConversationThemeModel,
    MessageModel,
    SocketMessage,
    UserStatus,
} from '~/type/type'

interface Conversation<T> {
    [key: string]: T
}

const PER_PAGE = 10

const Conversations = () => {
    const theme = useAppSelector(getCurrentTheme)

    const groupConversationsByUuid = (conversations: ConversationModel[]) => {
        return conversations.reduce<Conversation<ConversationModel>>((acc, conversation) => {
            acc[conversation.uuid] = conversation

            return acc
        }, {})
    }

    const {
        data: conversations,
        isLoading,
        mutate: mutateConversations,
    } = useSWR(
        SWRKey.GET_CONVERSATIONS,
        async () => {
            const response = await conversationService.getConversations({ page: 1, per_page: PER_PAGE })

            return {
                data: response?.data ? groupConversationsByUuid(response.data) : {},
                meta: response?.meta,
            }
        },
        {
            revalidateOnMount: true,
        },
    )

    const [conversationUserMap, setConversationUserMap] = useState<Record<string, string>>({})

    const Loading = () => {
        return (
            <>
                <div className="mt-4 flex items-center gap-2">
                    <Skeleton width={56} height={56} circle />
                    <div>
                        <Skeleton width={200} height={20} />
                        <Skeleton width={160} height={20} />
                    </div>
                </div>
            </>
        )
    }

    useEffect(() => {
        const socketHandler = (data: SocketMessage) => {
            if (!conversations?.data) {
                return
            }

            let conversationData

            if (conversations.data?.[data.conversation.uuid]) {
                conversationData = conversations.data[data.conversation.uuid]
                delete conversations.data[data.conversation.uuid]
            }

            if (!conversationData) {
                conversationData = data.conversation
            }

            const conversationMutate = {
                data: {
                    [data.conversation.uuid]: {
                        ...conversationData,
                        last_message: data.conversation.last_message,
                        members: conversationData.members.map((member: ConversationMember, index: number) => {
                            return {
                                ...member,
                                user: {
                                    ...member.user,
                                    is_online: conversationData.members[index].user.is_online,
                                    last_online_at: conversationData.members[index].user.last_online_at,
                                },
                            }
                        }),
                    },
                    ...conversations.data,
                },
                meta: conversations?.meta,
            }

            mutateConversations(conversationMutate, {
                revalidate: false,
            })
        }

        socket.on(SocketEvent.NEW_MESSAGE, socketHandler)

        return () => {
            socket.off(SocketEvent.NEW_MESSAGE, socketHandler)
        }
    }, [conversations, mutateConversations])

    useEffect(() => {
        const socketHandler = (data: UserStatus) => {
            if (conversationUserMap[data.user_id]) {
                if (!conversations?.data) {
                    return
                }

                // if conversation has been deleted
                if (!conversations.data[conversationUserMap[data.user_id]]) {
                    return
                }

                mutateConversations(
                    {
                        data: {
                            ...conversations.data,
                            [conversationUserMap[data.user_id]]: {
                                ...conversations.data[conversationUserMap[data.user_id]],
                                members: conversations.data[conversationUserMap[data.user_id]].members.map(
                                    (member: ConversationMember) => {
                                        if (member.user_id === data.user_id) {
                                            return { ...member, user: { ...member.user, is_online: data.is_online } }
                                        }
                                        return member
                                    },
                                ),
                            },
                        },
                        meta: conversations?.meta,
                    },
                    {
                        revalidate: false,
                    },
                )
            } else {
                for (const key in conversations?.data) {
                    const conversation: ConversationModel = conversations.data[key]

                    if (!conversation.is_group) {
                        const hasUser = conversation.members.find((member) => member.user_id === data.user_id)

                        if (hasUser) {
                            mutateConversations(
                                {
                                    data: {
                                        ...conversations.data,
                                        [key]: {
                                            ...conversation,
                                            members: conversation.members.map((member) => {
                                                if (member.user_id === data.user_id) {
                                                    return {
                                                        ...member,
                                                        user: {
                                                            ...member.user,
                                                            is_online: data.is_online,
                                                        },
                                                    }
                                                }
                                                return member
                                            }),
                                        },
                                    },
                                    meta: conversations?.meta,
                                },
                                { revalidate: false },
                            )

                            setConversationUserMap((prev) => ({
                                ...prev,
                                [data.user_id]: key,
                            }))
                        }
                    }
                }
            }
        }

        socket.on(SocketEvent.USER_STATUS, socketHandler)

        return () => {
            socket.off(SocketEvent.USER_STATUS, socketHandler)
        }
    }, [conversationUserMap, conversations, mutateConversations])

    // update last message is read
    useEffect(() => {
        const remove = listenEvent('MESSAGE:READ-MESSAGE', ({ conversationUuid }) => {
            if (conversations?.data?.[conversationUuid]) {
                const newData = {
                    ...conversations?.data[conversationUuid],
                    last_message: {
                        ...conversations?.data[conversationUuid].last_message,
                        is_read: true,
                    },
                }

                mutateConversations(
                    {
                        data: {
                            ...conversations.data,
                            [conversationUuid]: newData,
                        },
                        meta: conversations?.meta,
                    },
                    {
                        revalidate: false,
                    },
                )
            }
        })

        return remove
    }, [conversations, mutateConversations])

    useEffect(() => {
        interface RevokeMessage {
            message_id: number
            conversation_uuid: string
        }

        const socketHandler = ({ message_id, conversation_uuid }: RevokeMessage) => {
            if (conversations?.data?.[conversation_uuid]) {
                if (conversations.data[conversation_uuid].last_message.id === message_id) {
                    const newData = {
                        ...conversations.data[conversation_uuid],
                        last_message: {
                            ...conversations.data[conversation_uuid].last_message,
                            content: null,
                        },
                    }

                    mutateConversations(
                        {
                            data: {
                                ...conversations.data,
                                [conversation_uuid]: newData,
                            },
                            meta: conversations?.meta,
                        },
                        {
                            revalidate: false,
                        },
                    )
                }
            }
        }

        socket.on(SocketEvent.MESSAGE_REVOKE, socketHandler)

        return () => {
            socket.off(SocketEvent.MESSAGE_REVOKE, socketHandler)
        }
    }, [conversations, mutateConversations])

    useEffect(() => {
        const socketHandler = ({ message: data }: { message: MessageModel }) => {
            if (!data) {
                return
            }

            if (!conversations) {
                return
            }

            let conversation: ConversationModel | null = null

            for (const key in conversations.data) {
                if (conversations.data[key].id === data.conversation_id) {
                    conversation = conversations.data[key]
                }
            }

            if (!conversation) {
                return
            }

            if (conversation.last_message.id === data.id) {
                const newData = {
                    ...conversation,
                    last_message: {
                        ...conversation.last_message,
                        message_status: data.message_status,
                    },
                }

                mutateConversations(
                    {
                        data: {
                            ...conversations.data,
                            [conversation.uuid]: newData,
                        },
                        meta: conversations?.meta,
                    },
                    {
                        revalidate: false,
                    },
                )
            }
        }

        socket.on(SocketEvent.UPDATE_READ_MESSAGE, socketHandler)

        return () => {
            socket.off(SocketEvent.UPDATE_READ_MESSAGE, socketHandler)
        }
    }, [conversations, mutateConversations])

    useEffect(() => {
        interface ConversationRenamedPayload {
            conversation_uuid: string
            value: string | ConversationThemeModel
            key: 'name' | 'avatar' | 'theme' | 'emoji'
        }

        const socketHandler = ({ conversation_uuid, value, key }: ConversationRenamedPayload) => {
            mutateConversations(
                (prev) => {
                    if (!prev) {
                        return prev
                    }

                    if (!prev.data) {
                        return prev
                    }

                    const newData = {
                        data: {
                            ...prev.data,
                            [conversation_uuid]: {
                                ...prev.data[conversation_uuid],
                                [key]: value,
                            },
                        },
                        meta: prev.meta,
                    }

                    return newData
                },
                {
                    revalidate: false,
                },
            )
        }

        socket.on(SocketEvent.CONVERSATION_RENAMED, socketHandler)
        socket.on(SocketEvent.CONVERSATION_AVATAR_CHANGED, socketHandler)

        return () => {
            socket.off(SocketEvent.CONVERSATION_RENAMED, socketHandler)
            socket.off(SocketEvent.CONVERSATION_AVATAR_CHANGED, socketHandler)
        }
    }, [mutateConversations])

    useEffect(() => {
        const socketHandler = () => {
            mutateConversations()
        }

        socket.on(SocketEvent.CONVERSATION_MEMBER_JOINED, socketHandler)

        return () => {
            socket.off(SocketEvent.CONVERSATION_MEMBER_JOINED, socketHandler)
        }
    }, [mutateConversations])

    useEffect(() => {
        const remove = listenEvent('CONVERSATION:LEAVE-GROUP', ({ conversation_uuid }) => {
            const newConversationsData = { ...conversations?.data }

            delete newConversationsData[conversation_uuid]

            mutateConversations(
                {
                    data: newConversationsData,
                    meta: conversations?.meta,
                },
                {
                    revalidate: false,
                },
            )
        })

        return remove
    }, [conversations, mutateConversations])

    useEffect(() => {
        const socketHandler = (data: ConversationModel) => {
            mutateConversations(
                {
                    data: {
                        [data.uuid]: data,
                        ...conversations?.data,
                    },
                    meta: conversations?.meta,
                },
                {
                    revalidate: false,
                },
            )
        }

        socket.on(SocketEvent.NEW_CONVERSATION, socketHandler)

        return () => {
            socket.off(SocketEvent.NEW_CONVERSATION, socketHandler)
        }
    }, [conversations?.data, conversations?.meta, mutateConversations])

    return (
        <div className="h-full w-full pt-4">
            {isLoading ? (
                [1, 2, 3, 4, 5, 6, 7].map((_, index) => {
                    return <Loading key={index} />
                })
            ) : conversations && conversations.data && Object.keys(conversations.data).length > 0 ? (
                <InfiniteScroll
                    dataLength={Object.keys(conversations.data).length || 0}
                    next={async () => {
                        try {
                            const response = await conversationService.getConversations({
                                page: (conversations.meta?.pagination.current_page || 0) + 1,
                                per_page: PER_PAGE,
                            })

                            if (!response?.data) return

                            mutateConversations(
                                {
                                    data: {
                                        ...conversations.data,
                                        ...groupConversationsByUuid(response.data),
                                    },
                                    meta: response.meta,
                                },
                                {
                                    revalidate: false,
                                },
                            )
                        } catch (error) {
                            handleApiError(error)
                        }
                    }}
                    className="overflow-hidden!"
                    hasMore={
                        conversations.meta
                            ? conversations.meta.pagination.current_page < conversations.meta.pagination.total_pages
                            : false
                    }
                    loader={
                        <div className="flex justify-center">
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        </div>
                    }
                    scrollableTarget="sidebar-scroll-container"
                    scrollThreshold={0.9}
                >
                    {Object.keys(conversations.data).map((uuid) => {
                        return (
                            <div key={uuid} className="pr-2">
                                <ConversationItem conversation={conversations.data![uuid]} />
                            </div>
                        )
                    })}
                </InfiniteScroll>
            ) : (
                <div className="flex h-full flex-col items-center justify-center">
                    <Image
                        src={
                            theme === 'dark'
                                ? '/static/media/empty-message-light.png'
                                : '/static/media/empty-message-dark.png'
                        }
                        alt="empty-conversation"
                        width={100}
                        height={100}
                        priority
                    />
                    <h2>Không có tin nhắn nào</h2>
                    <p className="mt-2 text-sm text-gray-500">Tin nhắn mới sẽ hiển thị ở đây</p>
                </div>
            )}
        </div>
    )
}

export default Conversations
