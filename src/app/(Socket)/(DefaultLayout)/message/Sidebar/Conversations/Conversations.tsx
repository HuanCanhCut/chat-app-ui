'use client'

import React, { useEffect, useState } from 'react'
import useSWR from 'swr'

import SWRKey from '~/enum/SWRKey'
import * as conversationService from '~/services/conversationService'
import ConversationItem from './ConversationItem'
import { useAppSelector } from '~/redux'
import { getCurrentTheme } from '~/redux/selector'
import Image from 'next/image'
import Skeleton from 'react-loading-skeleton'
import socket from '~/helpers/socket'
import { SocketEvent } from '~/enum/SocketEvent'
import { ConversationMember, ConversationModel, SocketMessage } from '~/type/type'
import { listenEvent } from '~/helpers/events'

type UserStatus = {
    user_id: number
    is_online: boolean
    last_online_at: string | null
}

interface Conversation<T> {
    [key: string]: T
}

const Conversations = () => {
    const theme = useAppSelector(getCurrentTheme)

    const {
        data: conversations,
        isLoading,
        mutate: mutateConversations,
    } = useSWR(
        SWRKey.GET_CONVERSATIONS,
        async () => {
            const response = await conversationService.getConversations({ page: 1 })
            const groupConversationsByUuid = response?.data?.reduce<Conversation<ConversationModel>>(
                (acc, conversation) => {
                    acc[conversation.uuid] = conversation
                    return acc
                },
                {},
            )
            return groupConversationsByUuid
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
        socket.on(SocketEvent.NEW_MESSAGE, (data: SocketMessage) => {
            let conversationData

            if (conversations?.[data.conversation.uuid]) {
                conversationData = conversations[data.conversation.uuid]
                delete conversations[data.conversation.uuid]
            }

            if (!conversationData) {
                conversationData = data.conversation
            }

            const conversationMutate = {
                [data.conversation.uuid]: {
                    ...conversationData,
                    last_message: data.conversation.last_message,
                    conversation_members: conversationData.conversation_members.map(
                        (member: ConversationMember, index: number) => {
                            return {
                                ...member,
                                user: {
                                    ...member.user,
                                    is_online: conversationData.conversation_members[index].user.is_online,
                                    last_online_at: conversationData.conversation_members[index].user.last_online_at,
                                },
                            }
                        },
                    ),
                },
                ...conversations,
            }

            mutateConversations(conversationMutate, {
                revalidate: false,
            })
        })
    }, [conversations, mutateConversations])

    useEffect(() => {
        socket.on(SocketEvent.USER_STATUS, (data: UserStatus) => {
            if (conversationUserMap[data.user_id]) {
                if (!conversations) {
                    return
                }

                // if conversation has been deleted
                if (!conversations[conversationUserMap[data.user_id]]) {
                    return
                }

                mutateConversations(
                    {
                        ...conversations,
                        [conversationUserMap[data.user_id]]: {
                            ...conversations[conversationUserMap[data.user_id]],
                            conversation_members: conversations[
                                conversationUserMap[data.user_id]
                            ].conversation_members.map((member: ConversationMember) => {
                                if (member.user_id === data.user_id) {
                                    return { ...member, user: { ...member.user, is_online: data.is_online } }
                                }
                                return member
                            }),
                        },
                    },
                    {
                        revalidate: false,
                    },
                )
            } else {
                for (const key in conversations) {
                    const conversation: ConversationModel = conversations[key]

                    if (!conversation.is_group) {
                        const hasUser = conversation.conversation_members.find(
                            (member) => member.user_id === data.user_id,
                        )

                        if (hasUser) {
                            mutateConversations(
                                {
                                    ...conversations,
                                    [key]: {
                                        ...conversation,
                                        conversation_members: conversation.conversation_members.map((member) => {
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
        })
    }, [conversationUserMap, conversations, mutateConversations])

    // update last message is read
    useEffect(() => {
        const remove = listenEvent({
            eventName: 'message:read-message',
            handler: ({ detail: conversationUuid }: { detail: string }) => {
                if (conversations?.[conversationUuid]) {
                    const newData = {
                        ...conversations[conversationUuid],
                        last_message: {
                            ...conversations[conversationUuid].last_message,
                            is_read: true,
                        },
                    }

                    mutateConversations({ ...conversations, [conversationUuid]: newData }, { revalidate: false })
                }
            },
        })

        return remove
    }, [conversations, mutateConversations])

    useEffect(() => {
        interface RevokeMessage {
            message_id: number
            conversation_uuid: string
        }

        socket.on(SocketEvent.MESSAGE_REVOKE, ({ message_id, conversation_uuid }: RevokeMessage) => {
            if (conversations?.[conversation_uuid]) {
                if (conversations[conversation_uuid].last_message.id === message_id) {
                    const newData = {
                        ...conversations[conversation_uuid],
                        last_message: {
                            ...conversations[conversation_uuid].last_message,
                            content: null,
                        },
                    }

                    mutateConversations({ ...conversations, [conversation_uuid]: newData }, { revalidate: false })
                }
            }
        })
    }, [conversations, mutateConversations])

    return (
        <div className="h-full w-full pt-4">
            {isLoading ? (
                [1, 2, 3, 4, 5, 6, 7].map((_, index) => {
                    return <Loading key={index} />
                })
            ) : conversations && Object.keys(conversations).length > 0 ? (
                Object.keys(conversations).map((uuid) => {
                    return (
                        <div key={uuid} className="pr-2">
                            <ConversationItem conversation={conversations[uuid]} />
                        </div>
                    )
                })
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
