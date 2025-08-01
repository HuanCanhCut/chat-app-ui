import React, { memo, useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

import MessageItem from './MessageItem'
import ScrollToBottom from './ScrollToBottom'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Typing from '~/components/Typing'
import { SocketEvent } from '~/enum/SocketEvent'
import SWRKey from '~/enum/SWRKey'
import { listenEvent, sendEvent } from '~/helpers/events'
import socket from '~/helpers/socket'
import { useAppSelector } from '~/redux'
import { getCurrentTheme, getCurrentUser } from '~/redux/selector'
import * as messageServices from '~/services/messageService'
import { ConversationModel, MessageModel, MessageResponse, SocketMessage } from '~/type/type'
import { toast } from '~/utils/toast'

interface MessageRef {
    [key: string]: HTMLDivElement
}

const PER_PAGE = 20

interface MessageProps {
    conversation: ConversationModel
}
const Message: React.FC<MessageProps> = ({ conversation }) => {
    const { uuid } = useParams()

    const currentUser = useAppSelector(getCurrentUser)

    const theme = useAppSelector(getCurrentTheme)

    // save offset range for scroll down and scroll up
    const [offsetRange, setOffsetRange] = useState({
        start: 0, // for scroll down
        end: PER_PAGE, // for scroll up
    })

    const prevScrollY = useRef(0)
    const isScrollLoading = useRef(false)
    const messageRefs = useRef<MessageRef>({})
    const scrollableRef = useRef<HTMLDivElement>(null)
    const isJumpingToMessage = useRef(false)

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

    // Join room when component mount and current user is not banned
    useEffect(() => {
        const member = conversation?.members.find((member) => member.user_id === currentUser?.data?.id)
        // if current user is banned, not join room
        if (member?.deleted_at || !member) {
            return
        }

        let timeout: NodeJS.Timeout | null = null
        let delayRetry = 500
        let retryCount = 0
        const maxRetries = 10

        const joinRoom = () => {
            if (!socket.connected) {
                if (retryCount >= maxRetries) {
                    return
                }

                if (timeout) {
                    clearTimeout(timeout)
                }

                retryCount++
                timeout = setTimeout(() => {
                    joinRoom()
                }, delayRetry)
            } else {
                retryCount = 0
                socket.emit(SocketEvent.JOIN_ROOM, uuid)
            }
        }

        joinRoom()
    }, [conversation?.members, currentUser?.data?.id, uuid])

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

                // Do not mutate new messages if the latest messages have not been downloaded.
                if (offsetRange.start !== 0) {
                    mutateMessages(
                        {
                            ...messages,
                            meta: {
                                ...messages?.meta,
                                pagination: {
                                    ...messages?.meta.pagination,
                                    total: messages?.meta.pagination.total + 1,
                                    offset: messages?.meta.pagination.offset + 1,
                                },
                            },
                        },
                        {
                            revalidate: false,
                        },
                    )

                    setOffsetRange((prev) => {
                        return {
                            ...prev,
                            start: prev.start + 1,
                            end: prev.end + 1,
                        }
                    })

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
                        meta: {
                            ...messages?.meta,
                            pagination: {
                                ...messages?.meta.pagination,
                                total: messages?.meta.pagination.total + 1,
                            },
                        },
                    },
                    {
                        revalidate: false,
                    },
                )

                setOffsetRange((prev) => {
                    return {
                        ...prev,
                        start: prev.start,
                        end: prev.end + 1,
                    }
                })
            }
        }

        socket.on(SocketEvent.NEW_MESSAGE, socketHandler)

        return () => {
            socket.off(SocketEvent.NEW_MESSAGE, socketHandler)
        }
    }, [messages, mutateMessages, offsetRange.start, uuid])

    useEffect(() => {
        const socketHandler = ({
            message: data,
            user_read_id,
            conversation_uuid,
        }: {
            message: MessageModel
            user_read_id: number
            conversation_uuid: string
        }) => {
            if (conversation_uuid !== uuid) {
                return
            }

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
                        if (status?.receiver_id !== currentUser?.data?.id && user_read_id === status.receiver_id) {
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
    }, [currentUser?.data?.id, messages?.data, messages?.meta, mutateMessages, uuid])

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
        if (isJumpingToMessage.current) {
            return
        }

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

    useEffect(() => {
        interface Detail {
            parentMessage: MessageModel
            type: string
        }

        const remove = listenEvent({
            eventName: 'message:scroll-to-message',
            handler: async ({ detail: { parentMessage, type } }: { detail: Detail }) => {
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

                    if (messageElement) {
                        messageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

                        isJumpingToMessage.current = true

                        setTimeout(() => {
                            isJumpingToMessage.current = false
                        }, 1000)

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
                        if (aroundMessage?.meta.pagination.offset <= offsetRange.end && type === 'reply') {
                            const diffOffset = offsetRange.end - aroundMessage?.meta.pagination.offset
                            aroundMessage.data.splice(0, diffOffset)

                            if (!messages?.data) {
                                return
                            }

                            const newMessages = [...messages.data, ...aroundMessage.data]
                            const messageItem = newMessages.find((message) => message.id === parentMessage.id)

                            if (messageItem) {
                                requestIdleCallback(() => {
                                    handleAnimate(messageRefs.current[messageItem.id])
                                })
                            }

                            mutateMessages(
                                {
                                    data: newMessages,
                                    meta: aroundMessage.meta,
                                },
                                {
                                    revalidate: false,
                                },
                            )

                            setOffsetRange((prev) => {
                                return {
                                    ...prev,
                                    end: prev.end + aroundMessage.meta.pagination.offset,
                                }
                            })
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
                                { revalidate: false },
                            )

                            const messageItem = aroundMessage.data.find((message) => message.id === parentMessage.id)
                            if (messageItem) {
                                requestIdleCallback(() => {
                                    const messageElement = messageRefs.current[messageItem.id]

                                    if (messageElement) {
                                        handleAnimate(messageElement)
                                    }
                                })
                            }
                        }
                    }
                }
            },
        })

        return remove
    }, [messages?.data, mutateMessages, offsetRange.end, uuid])

    return (
        <div
            className={`relative flex-grow !overflow-hidden`}
            onKeyDown={handleEnterMessage}
            style={{
                backgroundImage: `var(--background-theme-${theme}-background)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div
                className="flex h-full max-h-full flex-col-reverse overflow-y-auto scroll-smooth"
                id="message-scrollable"
                onScroll={handleScrollDown}
                ref={scrollableRef}
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
                            {index === 0 && <Typing />}

                            <MessageItem
                                message={message}
                                messageIndex={index}
                                messages={messages}
                                currentUser={currentUser?.data}
                                messageRef={(el) => {
                                    messageRefs.current[message.id] = el
                                }}
                            />
                        </React.Fragment>
                    ))}
                </InfiniteScroll>

                <ScrollToBottom
                    offsetRange={offsetRange}
                    scrollableRef={scrollableRef}
                    messageRefs={messageRefs}
                    PER_PAGE={PER_PAGE}
                    setOffsetRange={setOffsetRange}
                />
            </div>
        </div>
    )
}

export default memo(Message)
