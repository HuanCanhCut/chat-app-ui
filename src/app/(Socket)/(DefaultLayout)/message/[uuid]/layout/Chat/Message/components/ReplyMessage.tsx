import { faReply } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { forwardRef, LegacyRef } from 'react'
import { mutate } from 'swr'

import Image from '~/components/Image'
import { MessageModel, MessageResponse, UserModel } from '~/type/type'
import * as messageServices from '~/services/messageService'
import { useParams } from 'next/navigation'
import SWRKey from '~/enum/SWRKey'

interface MessageRef {
    [key: string]: HTMLDivElement
}

interface ReplyMessageProps {
    message: MessageModel
    currentUser?: UserModel
    messageRefs: MessageRef
    offsetRange: { start: number; end: number }
    // eslint-disable-next-line no-unused-vars
    setOffsetRange: React.Dispatch<
        React.SetStateAction<{
            start: number
            end: number
        }>
    >
}

const PER_PAGE = 20

const ReplyMessage = (
    { message, currentUser, messageRefs, offsetRange, setOffsetRange }: ReplyMessageProps,
    ref: LegacyRef<HTMLDivElement>,
) => {
    const { uuid } = useParams()

    const handleScrollToMessage = async (parentMessage: MessageModel) => {
        console.log(parentMessage)

        const handleAnimate = (messageElement: HTMLDivElement) => {
            Object.values(messageRefs).forEach((ref) => {
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

        const messageElement = messageRefs[parentMessage.id]
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
                    mutate(
                        [SWRKey.GET_MESSAGES, uuid],
                        (prev: MessageResponse | undefined) => {
                            if (!prev) {
                                return prev
                            }
                            const newMessages = [...prev.data, ...aroundMessage.data]
                            const messageItem = newMessages.find((message) => message.id === parentMessage.id)
                            if (messageItem) {
                                requestIdleCallback(() => {
                                    handleAnimate(messageRefs[messageItem.id])
                                })
                            }
                            return {
                                ...prev,
                                data: newMessages,
                                meta: aroundMessage.meta,
                            }
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
                    mutate(
                        [SWRKey.GET_MESSAGES, uuid],
                        (prev: MessageResponse | undefined) => {
                            if (!prev) {
                                return prev
                            }
                            return {
                                data: aroundMessage.data,
                                meta: aroundMessage.meta,
                            }
                        },
                        {
                            revalidate: false,
                        },
                    )
                    const messageItem = aroundMessage.data.find((message) => message.id === parentMessage.id)
                    if (messageItem) {
                        requestIdleCallback(() => {
                            handleAnimate(messageRefs[messageItem.id])
                        })
                    }
                }
            }
        }
    }

    return (
        <>
            {message.parent &&
                (message.parent.type === 'text' || message.parent.type === 'icon' ? (
                    <div
                        className={`absolute bottom-[calc(100%-20px)] w-fit max-w-[85%] cursor-pointer ${message.sender_id === currentUser?.id ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}
                        ref={ref}
                    >
                        <p className="mb-1 flex w-fit items-center gap-2 text-right text-xs text-zinc-400 dark:text-zinc-500">
                            <FontAwesomeIcon icon={faReply} />
                            {'  '}
                            {message.sender_id === currentUser?.id
                                ? `Bạn đã trả lời ${message.parent.sender_id === currentUser?.id ? 'chính mình' : message.parent.sender.full_name}`
                                : `${message.parent.sender.full_name} đã trả lời ${message.parent.sender_id === currentUser?.id ? 'bạn' : message.sender_id === message.parent.sender_id ? 'chính mình' : message.parent.sender.full_name}`}
                        </p>
                        <span
                            className={`line-clamp-2 max-w-fit overflow-hidden text-ellipsis break-words rounded-2xl ${message.sender_id === currentUser?.id ? 'rounded-br-none' : 'rounded-bl-none'} bg-[#feeace] px-3 py-1.5 pb-6 text-[13px] font-light text-zinc-600 [word-break:break-word] dark:bg-[#a0a0a08d] dark:text-zinc-400`}
                            onClick={() => {
                                handleScrollToMessage(message.parent as MessageModel)
                            }}
                        >
                            {message.parent.content !== null
                                ? message.parent.content
                                : message.parent.sender_id === currentUser?.id
                                  ? 'Đã gỡ tin nhắn'
                                  : 'Tin nhắn đã bị gỡ'}
                        </span>
                    </div>
                ) : (
                    <div
                        className={`absolute bottom-[calc(100%-20px)] cursor-pointer ${message.sender_id === currentUser?.id ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}
                        ref={ref}
                    >
                        <p className="mb-1 flex w-fit items-center gap-2 text-right text-xs text-zinc-400 dark:text-zinc-500">
                            <FontAwesomeIcon icon={faReply} />
                            {'  '}
                            {message.sender_id === currentUser?.id
                                ? `Bạn đã trả lời ${message.parent.sender_id === currentUser?.id ? 'chính mình' : message.parent.sender.full_name}`
                                : `${message.parent.sender.full_name} đã trả lời ${message.parent.sender_id === currentUser?.id ? 'bạn' : message.sender_id === message.parent.sender_id ? 'chính mình' : message.parent.sender.full_name}`}
                        </p>
                        <Image
                            //  only show first image
                            src={
                                message.parent?.content && message.parent.type === 'image'
                                    ? JSON.parse(message.parent?.content as string)[0]
                                    : ''
                            }
                            alt="reply-message"
                            className="h-24 w-24 rounded-2xl opacity-70"
                            onClick={() => {
                                handleScrollToMessage(message.parent as MessageModel)
                            }}
                        />
                    </div>
                ))}
        </>
    )
}

export default forwardRef(ReplyMessage)
