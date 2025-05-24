import { useParams } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import InfiniteScroll from 'react-infinite-scroll-component'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import * as messageServices from '~/services/messageService'

import { SocketEvent } from '~/enum/SocketEvent'
import SWRKey from '~/enum/SWRKey'
import { sendEvent } from '~/helpers/events'
import socket from '~/helpers/socket'
import { MessageModel, MessageResponse, SocketMessage } from '~/type/type'
import MessageItem from './MessageItem'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'

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

    const handleScrollToMessage = useCallback(
        async (parentMessage: MessageModel) => {
            const handleAnimate = (messageElement: HTMLDivElement) => {
                Object.values(messageRefs.current).forEach((ref) => {
                    if (!ref) {
                        return
                    }

                    ref.classList.remove(
                        'border-[2px]',
                        'border-white',
                        'dark:border-zinc-800',
                        'shadow-[0_0_0_1px_#222]',
                        'dark:shadow-[0_0_0_1px_#fff]',
                        'animate-scale-up',
                    )
                })

                messageElement.scrollIntoView({ behavior: 'smooth', block: 'start' })

                const observer = new IntersectionObserver(
                    ([entry]) => {
                        if (entry.isIntersecting) {
                            messageElement.classList.add(
                                'border-[2px]',
                                'border-white',
                                'dark:border-zinc-800',
                                'shadow-[0_0_0_1px_#222]',
                                'dark:shadow-[0_0_0_1px_#fff]',
                            )

                            setTimeout(() => {
                                messageElement.classList.add('animate-scale-up')
                            }, 250)

                            observer.disconnect()
                        }
                    },
                    {
                        threshold: 0.5,
                    },
                )

                observer.observe(messageElement)
            }

            const messageElement = messageRefs.current[parentMessage.id]

            // if reply message is loaded
            if (messageElement) {
                handleAnimate(messageElement)
            } else {
                const aroundMessage = await messageServices.getAroundMessages({
                    conversationUuid: uuid as string,
                    messageId: parentMessage.id,
                    limit: PER_PAGE,
                })

                if (aroundMessage) {
                    // if around message is the next range of the current range
                    if (aroundMessage?.meta.pagination.offset <= offsetRange.end) {
                        const diffOffset = offsetRange.end - aroundMessage?.meta.pagination.offset

                        aroundMessage.data.splice(0, diffOffset)

                        if (!messages?.data) {
                            return
                        }

                        const newMessages = [...messages?.data, ...aroundMessage.data]

                        setOffsetRange((prev) => {
                            return {
                                ...prev,
                                end: prev.end + aroundMessage.meta.pagination.offset,
                            }
                        })

                        mutateMessages(
                            {
                                data: newMessages,
                                meta: aroundMessage.meta,
                            },
                            {
                                revalidate: false,
                            },
                        )
                        const messageItem = newMessages.find((message) => message.id === parentMessage.id)

                        if (messageItem) {
                            requestIdleCallback(() => {
                                handleAnimate(messageRefs.current[messageItem.id])
                            })
                        }
                    } else {
                        setOffsetRange({
                            start: aroundMessage.meta.pagination.offset,
                            end: aroundMessage.meta.pagination.offset + aroundMessage.data.length,
                        })

                        mutateMessages(
                            {
                                data: aroundMessage.data,
                                meta: aroundMessage.meta,
                            },
                            {
                                revalidate: false,
                            },
                        )

                        const messageItem = aroundMessage.data.find((message) => message.id === parentMessage.id)

                        if (messageItem) {
                            requestIdleCallback(() => {
                                handleAnimate(messageRefs.current[messageItem.id])
                            })
                        }
                    }
                }
            }
        },
        [messages?.data, mutateMessages, offsetRange.end, uuid],
    )

    const handleScrollDown = async (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement

        const scrollTop = target.scrollTop // scroll top return negative number

        // if scroll down then handle
        if (scrollTop >= prevScrollY.current) {
            // check if scroll to the bottom with 100px
            if (scrollTop >= -100 && !isScrollLoading.current) {
                if (!messages?.data) {
                    return
                }

                const hasMore = messages.meta.pagination.offset !== 0

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

                console.log(messageRefs)

                if (response) {
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
                            start: prev.start - response.data.length,
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
        <div className="flex-grow overflow-hidden" onKeyDown={handleEnterMessage}>
            <div
                className="flex h-full max-h-full flex-col-reverse overflow-y-auto"
                id="message-scrollable"
                onScroll={handleScrollDown}
            >
                <InfiniteScroll
                    dataLength={messages?.data.length || 0} //This is important field to render the next data
                    next={async () => {
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
                    }}
                    className="flex flex-col-reverse gap-[2.5px] !overflow-hidden px-2 py-3"
                    hasMore={
                        messages
                            ? messages.meta.pagination.offset / PER_PAGE + 1 < messages.meta.pagination.total / PER_PAGE
                            : false
                    }
                    scrollThreshold="200px"
                    inverse={true}
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
                                messageRef={(el) => {
                                    messageRefs.current[message.id] = el
                                }}
                                handleScrollToMessage={handleScrollToMessage}
                            />
                        </React.Fragment>
                    ))}
                </InfiniteScroll>
            </div>
        </div>
    )
}

export default Message
