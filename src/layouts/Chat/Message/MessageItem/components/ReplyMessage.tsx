import { forwardRef, LegacyRef } from 'react'

import { faReply } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from '~/components/Image'
import { sendEvent } from '~/helpers/events'
import { ConversationMember, MessageModel, UserModel } from '~/type/type'

interface ReplyMessageProps {
    message: MessageModel
    currentUser?: UserModel
    memberMap: Record<number, ConversationMember>
}

const ReplyMessage = ({ message, currentUser, memberMap }: ReplyMessageProps, ref: LegacyRef<HTMLDivElement>) => {
    const handleScrollToMessage = (message: MessageModel) => {
        sendEvent({
            eventName: 'message:scroll-to-message',
            detail: {
                parentMessage: message,
                type: 'reply',
            },
        })
    }

    return (
        <>
            {message.parent &&
                (message.parent.type === 'text' || message.parent.type === 'icon' ? (
                    <div
                        className={`absolute bottom-[calc(100%-20px)] w-fit max-w-[85%] cursor-pointer ${message.sender_id === currentUser?.id ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}
                        ref={ref}
                    >
                        <p className="mb-1 flex w-fit items-center gap-2 text-right text-xs text-systemMessageLight dark:text-systemMessageDark">
                            <FontAwesomeIcon icon={faReply} />
                            {'  '}
                            {message.sender_id === currentUser?.id
                                ? `Bạn đã trả lời ${message.parent.sender_id === currentUser?.id ? 'chính mình' : memberMap[message.parent.sender_id]?.nickname || memberMap[message.parent.sender_id]?.user.full_name}`
                                : `${memberMap[message.sender_id]?.nickname || memberMap[message.sender_id]?.user.full_name} đã trả lời ${message.parent.sender_id === currentUser?.id ? 'bạn' : message.sender_id === message.parent.sender_id ? 'chính mình' : memberMap[message.parent.sender_id]?.nickname || memberMap[message.parent.sender_id]?.user.full_name}`}
                        </p>
                        <span
                            className={`line-clamp-1 max-w-[85%] overflow-hidden text-ellipsis whitespace-nowrap rounded-2xl ${message.sender_id === currentUser?.id ? 'rounded-br-none' : 'rounded-bl-none'} bg-[var(--reply-message-light-background-color)] px-3 py-1.5 pb-6 text-[13px] font-normal text-systemMessageLight dark:bg-[var(--reply-message-dark-background-color)] dark:text-systemMessageDark`}
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
                        <p className="mb-1 flex w-fit items-center gap-2 text-right text-xs text-systemMessageLight dark:text-systemMessageDark">
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
