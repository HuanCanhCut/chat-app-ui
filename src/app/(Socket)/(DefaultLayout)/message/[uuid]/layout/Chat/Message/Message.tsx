import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import useSWR from 'swr'
import InfiniteScroll from 'react-infinite-scroll-component'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import * as messageServices from '~/services/messageService'

import { SocketEvent } from '~/enum/SocketEvent'
import SWRKey from '~/enum/SWRKey'
import { listenEvent, sendEvent } from '~/helpers/events'
import socket from '~/helpers/socket'
import { MessageModel, MessageResponse, SocketMessage } from '~/type/type'
import MessageItem from './MessageItem'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'

const Message: React.FC = () => {
    const { uuid } = useParams()
    const currentUser = useAppSelector(getCurrentUser)

    const [page, setPage] = useState(1)

    const { data: messages, mutate: mutateMessages } = useSWR<MessageResponse | undefined>(
        uuid ? [SWRKey.GET_MESSAGES, uuid] : null,
        () => {
            return messageServices.getMessages({ conversationUuid: uuid as string, page: page })
        },
        {
            revalidateOnMount: true,
        },
    )

    // Join room when component mount
    useEffect(() => {
        socket.emit(SocketEvent.JOIN_ROOM, uuid)
    }, [uuid])

    useEffect(() => {
        const remove = listenEvent({
            eventName: 'message:emit-message',
            handler: ({ detail }: { detail: { conversationUuid: string; message: MessageModel } }) => {
                if (detail.conversationUuid === uuid) {
                    if (!messages?.data) {
                        return
                    }

                    mutateMessages(
                        {
                            data: [detail.message, ...messages?.data],
                            meta: messages?.meta,
                        },
                        {
                            revalidate: false,
                        },
                    )
                }
            },
        })

        return remove
    }, [messages?.data, messages?.meta, mutateMessages, uuid])

    useEffect(() => {
        const remove = listenEvent({
            eventName: 'message:revoke',
            handler: ({ detail }: { detail: { type: string; messageId: number } }) => {
                if (!messages?.data) {
                    return
                }

                switch (detail.type) {
                    case 'for-me':
                        const newMessages: MessageModel[] = []

                        for (const message of messages.data) {
                            if (message.id !== detail.messageId) {
                                if (message.parent?.id === detail.messageId) {
                                    message.parent = null
                                }

                                newMessages.push(message)
                            }
                        }

                        mutateMessages(
                            {
                                data: newMessages,
                                meta: messages?.meta,
                            },
                            {
                                revalidate: false,
                            },
                        )

                        break
                    case 'for-other':
                        break
                    default:
                        break
                }
            },
        })

        return remove
    }, [messages, mutateMessages])

    const handleEnterMessage = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            sendEvent({ eventName: 'message:enter-message', detail: { roomUuid: uuid } })
        }
    }

    useEffect(() => {
        if (page <= 1) {
            return
        }

        const getMoreMessages = async () => {
            const response = await messageServices.getMessages({
                conversationUuid: uuid as string,
                page: page,
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
            }
        }

        getMoreMessages()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, uuid])

    // Listen new message event
    useEffect(() => {
        socket.on(SocketEvent.NEW_MESSAGE, (data: SocketMessage) => {
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
        })
    }, [messages, mutateMessages, uuid])

    useEffect(() => {
        socket.on(
            SocketEvent.UPDATE_READ_MESSAGE,
            ({ message: data, user_read_id }: { message: MessageModel; user_read_id: number }) => {
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
            },
        )

        return () => {
            socket.off(SocketEvent.UPDATE_READ_MESSAGE)
        }
    }, [currentUser?.data?.id, messages?.data, messages?.meta, mutateMessages])

    useEffect(() => {
        socket.on(SocketEvent.REACT_MESSAGE, (data) => {
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
        })

        return () => {
            socket.off(SocketEvent.REACT_MESSAGE)
        }
    }, [messages?.data, messages?.meta, mutateMessages])

    useEffect(() => {
        socket.on(SocketEvent.REMOVE_REACTION, (data) => {
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
        })

        return () => {
            socket.off(SocketEvent.REMOVE_REACTION)
        }
    }, [messages?.data, messages?.meta, mutateMessages])

    useEffect(() => {
        interface RevokeMessage {
            message_id: number
            conversation_uuid: string
        }

        socket.on(SocketEvent.MESSAGE_REVOKE, ({ message_id, conversation_uuid }: RevokeMessage) => {
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
        })

        return () => {
            socket.off(SocketEvent.MESSAGE_REVOKE)
        }
    }, [currentUser?.data?.id, messages?.data, messages?.meta, mutateMessages, uuid])

    return (
        <div className="flex-grow overflow-hidden" onKeyDown={handleEnterMessage}>
            <div className="flex h-full max-h-full flex-col-reverse overflow-y-auto" id="message-scrollable">
                <InfiniteScroll
                    dataLength={messages?.data.length || 0} //This is important field to render the next data
                    next={() => {
                        setPage(page + 1)
                    }}
                    className="flex flex-col-reverse gap-[2.5px] px-2 py-3"
                    hasMore={
                        messages && messages?.meta.pagination.current_page < messages?.meta.pagination.total_pages
                            ? true
                            : false
                    }
                    inverse={true}
                    scrollThreshold={0.5}
                    loader={
                        <div className="flex justify-center">
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        </div>
                    }
                    scrollableTarget="message-scrollable"
                >
                    {messages?.data.map((message, index) => (
                        <React.Fragment key={index}>
                            <MessageItem
                                message={message}
                                messageIndex={index}
                                messages={messages}
                                currentUser={currentUser?.data}
                            />
                        </React.Fragment>
                    ))}
                </InfiniteScroll>
            </div>
        </div>
    )
}

export default Message
