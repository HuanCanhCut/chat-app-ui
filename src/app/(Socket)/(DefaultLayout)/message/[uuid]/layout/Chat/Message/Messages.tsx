import { useParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import InfiniteScroll from 'react-infinite-scroll-component'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import * as messageServices from '~/services/messageService'

import { SocketEvent } from '~/enum/SocketEvent'
import SWRKey from '~/enum/SWRKey'
import { sendEvent } from '~/helpers/events'
import socket from '~/helpers/socket'
import { MessageModel, MessageReactionModel, MessageResponse, SocketMessage, TopReaction } from '~/type/type'
import MessageItem from './MessageItem'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import { toast } from '~/utils/toast'

interface MessageRef {
    [key: string]: HTMLDivElement
}

const PER_PAGE = 20

const Message: React.FC = () => {
    const { uuid } = useParams()
    const currentUser = useAppSelector(getCurrentUser)

    // save offset range for scroll down and scroll up
    const [offsetRange, setOffsetRange] = useState({
        start: 0, // for scroll down
        end: PER_PAGE, // for scroll up
    })

    const prevScrollY = useRef(0)
    const isScrollLoading = useRef(false)
    const { data: messages, mutate: mutateMessages } = useSWR<MessageResponse | undefined>(
        uuid ? [SWRKey.GET_MESSAGES, uuid] : null,
        () => {
            return messageServices.getMessages({
                conversationUuid: uuid as string,
                limit: PER_PAGE,
                offset: 0,
            })
        },
        {
            revalidateOnMount: true,
        },
    )

    const messageRefs = useRef<MessageRef>({})

    // Join room when component mount
    useEffect(() => {
        socket.emit(SocketEvent.JOIN_ROOM, uuid)
    }, [uuid])

    const handleEnterMessage = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            sendEvent({ eventName: 'message:enter-message', detail: { roomUuid: uuid } })
        }
    }

    // Listen new message event
    useEffect(() => {
        const socketHandler = (data: SocketMessage) => {
            if (data.conversation.uuid === uuid) {
                if (!messages?.data) {
                    return
                }

                // revoke object url of image
                for (const message of messages.data) {
                    if (message.type === 'image' && message.content) {
                        JSON.parse(message.content).forEach((url: string) => {
                            if (url.startsWith('blob:')) {
                                URL.revokeObjectURL(url)
                            }
                        })
                    }
                }

                // @ts-ignore
                const previewMessageIndex = messages.data.findIndex((message) => message.is_preview)

                if (previewMessageIndex !== -1) {
                    messages.data.splice(previewMessageIndex, 1)
                }

                mutateMessages(
                    {
                        data: [data.conversation.last_message, ...messages?.data],
                        meta: messages?.meta,
                    },
                    {
                        revalidate: false,
                    },
                )
            }
        }

        socket.on(SocketEvent.NEW_MESSAGE, socketHandler)

        return () => {
            socket.off(SocketEvent.NEW_MESSAGE, socketHandler)
        }
    }, [messages, mutateMessages, uuid])

    useEffect(() => {
        const socketHandler = ({ message: data, user_read_id }: { message: MessageModel; user_read_id: number }) => {
            if (!messages?.data) {
                return
            }

            const userLastReadMessage = data.message_status.find((status) => {
                return status.receiver.id === user_read_id
            })

            // If someone in the group chat revokes a message on their side, the message read status is not processed.
            if (userLastReadMessage?.receiver.last_read_message_id) {
                if (
                    Number(user_read_id) !== currentUser?.data?.id &&
                    userLastReadMessage?.receiver.last_read_message_id < messages.data[0].id
                ) {
                    return
                }
            }

            let lastReadMessageId = 0

            const newMessages = messages?.data.map((message) => {
                if (message.id === data.id) {
                    return data
                }

                if (Number(user_read_id) !== currentUser?.data?.id) {
                    lastReadMessageId = data.id
                }

                if (Number(user_read_id) === currentUser?.data?.id && data.sender_id !== currentUser?.data?.id) {
                    lastReadMessageId = data.id
                }

                return {
                    ...message,
                    message_status: message.message_status.map((status) => {
                        if (status?.receiver_id !== currentUser?.data?.id) {
                            return {
                                ...status,
                                receiver: {
                                    ...status.receiver,
                                    last_read_message_id: !!lastReadMessageId
                                        ? lastReadMessageId
                                        : status.receiver.last_read_message_id,
                                },
                                status: 'read' as const,
                                read_at: new Date(),
                            }
                        }
                        return status
                    }),
                }
            })

            mutateMessages(
                {
                    data: newMessages,
                    meta: messages?.meta,
                },
                {
                    revalidate: false,
                },
            )
        }

        socket.on(SocketEvent.UPDATE_READ_MESSAGE, socketHandler)

        return () => {
            socket.off(SocketEvent.UPDATE_READ_MESSAGE, socketHandler)
        }
    }, [currentUser?.data?.id, messages?.data, messages?.meta, mutateMessages])

    useEffect(() => {
        interface ReactionMessage {
            reaction: MessageReactionModel
            total_reactions: number
            top_reactions: TopReaction[]
        }
        const socketHandler = (data: ReactionMessage) => {
            if (!messages?.data) {
                return
            }

            const newMessages = messages.data.map((message) => {
                if (message.id === data.reaction.message_id) {
                    return {
                        ...message,
                        top_reactions: data.top_reactions,
                        total_reactions: data.total_reactions,
                    }
                }

                return message
            })

            mutateMessages(
                {
                    data: newMessages,
                    meta: messages.meta,
                },
                {
                    revalidate: false,
                },
            )
        }

        socket.on(SocketEvent.REACT_MESSAGE, socketHandler)

        return () => {
            socket.off(SocketEvent.REACT_MESSAGE, socketHandler)
        }
    }, [messages?.data, messages?.meta, mutateMessages])

    useEffect(() => {
        interface RemoveReactionMessage {
            message_id: number
            total_reactions: number
            top_reactions: TopReaction[]
        }

        const socketHandler = (data: RemoveReactionMessage) => {
            if (!messages?.data) {
                return
            }

            const newMessages = messages.data.map((message) => {
                if (message.id === data.message_id) {
                    return {
                        ...message,
                        top_reactions: data.top_reactions,
                        total_reactions: data.total_reactions,
                    }
                }

                return message
            })

            mutateMessages(
                {
                    data: newMessages,
                    meta: messages.meta,
                },
                {
                    revalidate: false,
                },
            )
        }

        socket.on(SocketEvent.REMOVE_REACTION, socketHandler)

        return () => {
            socket.off(SocketEvent.REMOVE_REACTION, socketHandler)
        }
    }, [messages?.data, messages?.meta, mutateMessages])

    useEffect(() => {
        interface RevokeMessage {
            message_id: number
            conversation_uuid: string
        }

        const socketHandler = ({ message_id, conversation_uuid }: RevokeMessage) => {
            if (messages?.data) {
                if (conversation_uuid === uuid) {
                    const newMessages: MessageModel[] = []

                    for (const message of messages.data) {
                        if (message.parent?.id === message_id) {
                            message.parent = {
                                ...message.parent,
                                content:
                                    message.parent.sender_id === currentUser?.data?.id
                                        ? 'Đã gỡ tin nhắn'
                                        : 'Tin nhắn đã bị gỡ',
                            }
                        }

                        if (message.id === message_id) {
                            newMessages.push({
                                ...message,
                                content: null,
                                parent: null,
                            })
                        } else {
                            newMessages.push(message)
                        }
                    }

                    mutateMessages(
                        {
                            data: newMessages,
                            meta: messages.meta,
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
    }, [currentUser?.data?.id, messages?.data, messages?.meta, mutateMessages, uuid])

    const handleScrollDown = async (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement

        const scrollTop = target.scrollTop // scroll top return negative number

        // if scroll down then handle
        if (scrollTop >= prevScrollY.current) {
            // check if scroll to the bottom with 100px
            if (scrollTop >= -150 && !isScrollLoading.current) {
                if (!messages?.data) {
                    return
                }

                const hasMore = offsetRange.start !== 0

                if (!hasMore) {
                    return
                }

                isScrollLoading.current = true

                const offset = offsetRange.start - PER_PAGE >= 0 ? offsetRange.start - PER_PAGE : 0

                const response = await messageServices.getMessages({
                    conversationUuid: uuid as string,
                    limit: PER_PAGE,
                    offset,
                })

                if (response) {
                    if (messages.meta.pagination.offset - response.meta.pagination.offset < PER_PAGE) {
                        const diffOffset = messages.meta.pagination.offset - response.meta.pagination.offset

                        response.data.splice(diffOffset)
                    }
                    const newData: MessageResponse = {
                        data: [...response?.data, ...messages?.data],
                        meta: response?.meta,
                    }

                    mutateMessages(newData, {
                        revalidate: false,
                    })

                    setOffsetRange((prev) => {
                        return {
                            ...prev,
                            start: prev.start - response.data.length <= 0 ? 0 : prev.start - response.data.length,
                        }
                    })
                }
                setTimeout(() => {
                    isScrollLoading.current = false
                }, 500)
            }
        }

        prevScrollY.current = target.scrollTop
    }

    return (
        <div className="flex-grow !overflow-hidden" onKeyDown={handleEnterMessage}>
            <div
                className="flex h-full max-h-full flex-col-reverse overflow-y-auto scroll-smooth"
                id="message-scrollable"
                onScroll={handleScrollDown}
            >
                <InfiniteScroll
                    dataLength={messages?.data.length || 0}
                    next={async () => {
                        try {
                            const response = await messageServices.getMessages({
                                conversationUuid: uuid as string,
                                limit: PER_PAGE,
                                offset: offsetRange.end,
                            })

                            if (response) {
                                if (!messages?.data) {
                                    return
                                }

                                const newData: MessageResponse = {
                                    data: [...messages?.data, ...response.data],
                                    meta: response?.meta,
                                }

                                mutateMessages(newData, {
                                    revalidate: false,
                                })

                                setOffsetRange((prev) => {
                                    return {
                                        ...prev,
                                        end: response.meta.pagination.offset + response.data.length,
                                    }
                                })
                            }
                        } catch (error) {
                            toast('Có lỗi khi tải tin nhắn, vui lòng thử lại sau', 'error')
                        }
                    }}
                    className="flex flex-col-reverse gap-[2.5px] !overflow-hidden px-2 py-3"
                    hasMore={
                        messages
                            ? messages.meta.pagination.offset / PER_PAGE + 1 < messages.meta.pagination.total / PER_PAGE
                            : false
                    }
                    inverse={true}
                    loader={
                        <div className="flex justify-center">
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        </div>
                    }
                    scrollableTarget="message-scrollable"
                    scrollThreshold="150px"
                >
                    {messages?.data.map((message, index) => (
                        <React.Fragment key={message.id}>
                            <MessageItem
                                message={message}
                                messageIndex={index}
                                messages={messages}
                                currentUser={currentUser?.data}
                                messageRefs={messageRefs.current}
                                messageRef={(el) => {
                                    messageRefs.current[message.id] = el
                                }}
                                offsetRange={offsetRange}
                                setOffsetRange={setOffsetRange}
                            />
                        </React.Fragment>
                    ))}
                </InfiniteScroll>
            </div>
        </div>
    )
}

export default Message
