import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import useSWR from 'swr'
import InfiniteScroll from 'react-infinite-scroll-component'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import * as messageServices from '~/services/message'

import { ChatEvent } from '~/enum/socket/chat'
import SWRKey from '~/enum/SWRKey'
import { sendEvent } from '~/helpers/events'
import socket from '~/helpers/socket'
import { MessageModel, MessageResponse, SocketMessage } from '~/type/type'
import MessageItem from './MessageItem'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'

const Message: React.FC = () => {
    const { uuid } = useParams()
    const currentUser = useAppSelector(getCurrentUser)

    const [page, setPage] = useState(1)

    const { data: messages, mutate: mutateMessages } = useSWR(uuid ? [SWRKey.GET_MESSAGES, uuid] : null, () => {
        return messageServices.getMessages({ conversationUuid: uuid as string, page: page })
    })

    // Join room when component mount
    useEffect(() => {
        socket.emit(ChatEvent.JOIN_ROOM, uuid)
    }, [uuid])

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
        socket.on(ChatEvent.NEW_MESSAGE, (data: SocketMessage) => {
            if (data.conversation.uuid === uuid) {
                if (!messages?.data) {
                    return
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
        socket.on(ChatEvent.UPDATE_READ_MESSAGE, (data: MessageModel) => {
            if (!messages?.data) {
                return
            }

            const newMessages = messages?.data.map((message) => {
                if (message.id === data.id) {
                    return data
                }

                return message
            })

            mutateMessages({
                data: newMessages,
                meta: messages?.meta,
            })
        })

        return () => {
            socket.off(ChatEvent.UPDATE_READ_MESSAGE)
        }
    }, [messages, mutateMessages])

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
                        messages?.meta.pagination.current_page &&
                        messages?.meta.pagination.total_pages &&
                        messages?.meta.pagination.current_page < messages?.meta.pagination.total_pages
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
                                messages={messages?.data}
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
