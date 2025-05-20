import { faReply } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { forwardRef, LegacyRef } from 'react'
import Image from '~/components/Image'
import { MessageModel, UserModel } from '~/type/type'

interface MessageRef {
    [key: string]: HTMLDivElement
}

interface ReplyMessageProps {
    message: MessageModel
    currentUser?: UserModel
    messageRefs: MessageRef
}

const ReplyMessage = ({ message, currentUser, messageRefs }: ReplyMessageProps, ref: LegacyRef<HTMLDivElement>) => {
    const handleMoveToReplyMessage = (parentMessage: MessageModel) => {
        const messageElement = messageRefs[parentMessage.id]

        // if reply message is loaded
        if (messageElement) {
            Object.values(messageRefs).forEach((ref) => {
                ref.classList.remove(
                    'border-[2px]',
                    'border-white',
                    'dark:border-zinc-800',
                    'shadow-[0_0_0_1px_#222]',
                    'dark:shadow-[0_0_0_1px_#fff]',
                    'animate-scale-up',
                )
            })

            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })

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
                        }, 150)

                        observer.disconnect()
                    }
                },
                {
                    threshold: 0.5,
                },
            )

            observer.observe(messageElement)
        } else {
            //
        }
    }

    return (
        <>
            {message.parent ? (
                message.parent.type === 'text' || message.parent.type === 'icon' ? (
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
                                handleMoveToReplyMessage(message.parent as MessageModel)
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
                                handleMoveToReplyMessage(message.parent as MessageModel)
                            }}
                        />
                    </div>
                )
            ) : null}
        </>
    )
}

export default forwardRef(ReplyMessage)
