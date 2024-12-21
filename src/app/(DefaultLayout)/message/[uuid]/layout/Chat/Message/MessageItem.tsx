import { faEllipsisVertical, faShare } from '@fortawesome/free-solid-svg-icons'
import { faSmile } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@tippyjs/react'
import moment from 'moment-timezone'
import { useEffect, useRef } from 'react'

import { MessageModel, MessageStatus, UserModel } from '~/type/type'
import UserAvatar from '~/components/UserAvatar'
import useVisible from '~/hooks/useVisible'
import socket from '~/helpers/socket'
import { ChatEvent } from '~/enum/socket/chat'
import { useParams } from 'next/navigation'
import { sendEvent } from '~/helpers/events'

const MessageItem = ({
    message,
    index,
    messages,
    currentUser,
}: {
    message: MessageModel
    index: number
    messages: MessageModel[]
    currentUser: UserModel | undefined
}) => {
    const { uuid } = useParams()

    const options = { root: null, rootMargin: '0px', threshold: 0.5 }
    const firstMessageRef = useRef<HTMLDivElement>(null)
    const isFirstMessageVisible: boolean = useVisible(options, firstMessageRef)

    useEffect(() => {
        if (isFirstMessageVisible && currentUser?.id !== message.sender_id) {
            // If you haven't seen it, then emit. If you have seen it, then forget it.
            if (message.id === messages[0].id) {
                for (const status of messages[0].message_status) {
                    if (status.receiver_id === currentUser?.id && status.receiver.last_read_message_id === message.id) {
                        return
                    }
                }
            }

            socket.emit(ChatEvent.READ_MESSAGE, {
                conversationUuid: uuid as string,
                messageId: message.id,
            })

            sendEvent({ eventName: 'message:read-message', detail: uuid as string })
        }
    }, [isFirstMessageVisible, currentUser?.id, message.id, message.sender_id, uuid, messages])

    const diffTime =
        index > 0 &&
        Math.abs(
            moment
                .tz(messages[index].created_at, 'UTC')
                .diff(moment.tz(messages[index - 1].created_at, 'UTC'), 'minutes'),
        )

    const handleFormatTimeBetweenTwoMessage = (time: Date) => {
        const isSameDay =
            index > 0 &&
            moment(new Date(message.created_at)).isSame(moment(new Date(messages[index - 1].created_at)), 'day')

        const isSameWeek =
            index > 0 &&
            moment(new Date(message.created_at)).isSame(moment(new Date(messages[index - 1].created_at)), 'week')

        if (isSameDay) return moment(new Date(time)).locale('vi').format('HH:mm')
        if (isSameWeek) return moment(new Date(time)).locale('vi').format('HH:mm ddd')
        return moment(new Date(time)).locale('vi').format('DD [Tháng] MM, YYYY')
    }

    const handleFormatTime = (time: Date) => {
        const isSameDay = moment(new Date(time)).isSame(moment(new Date()), 'day')
        const isSameWeek = moment(new Date(time)).isSame(moment(new Date()), 'week')

        if (isSameDay) return moment(new Date(time)).locale('vi').format('HH:mm')
        if (isSameWeek) return moment(new Date(time)).locale('vi').format('HH:mm ddd')
        return moment(new Date(time)).locale('vi').format('DD [Tháng] MM, YYYY')
    }
    return (
        <div>
            <p className={`mb-2 text-center text-xs text-gray-400 ${Number(diffTime) < 10 ? 'hidden' : 'block'}`}>
                {handleFormatTimeBetweenTwoMessage(message.created_at)}
            </p>

            <div
                className={`group flex w-full items-center gap-3 ${message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
            >
                <div
                    className={`flex items-center gap-2 opacity-0 transition-opacity duration-100 group-hover:opacity-100 ${message.sender_id === currentUser?.id ? 'order-first' : 'order-last'}`}
                >
                    <button className="flex-center h-6 w-6 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-500 dark:hover:bg-gray-800">
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                    </button>
                    <button className="flex-center h-6 w-6 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-500 dark:hover:bg-gray-800">
                        <FontAwesomeIcon icon={faShare} />
                    </button>
                    <button className="flex-center h-6 w-6 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-500 dark:hover:bg-gray-800">
                        <FontAwesomeIcon icon={faSmile} />
                    </button>
                </div>
                {message.sender_id !== currentUser?.id && <UserAvatar src={message.sender.avatar} size={28} />}
                <Tippy content={handleFormatTime(message.created_at)} placement="left">
                    <p
                        ref={index === 0 ? firstMessageRef : null}
                        className={`w-fit max-w-[80%] rounded-3xl px-4 py-1.5 font-light ${
                            message.sender_id === currentUser?.id
                                ? 'bg-milk-tea text-white'
                                : 'bg-lightGray text-black dark:bg-[#313233] dark:text-dark'
                        }`}
                        key={index}
                    >
                        <span className="max-w-fit break-words">{message.content}</span>
                    </p>
                </Tippy>
            </div>

            <div className="flex justify-end pr-2">
                {message.message_status.map((status: MessageStatus, index: number) => {
                    // Only show 6 users who have read the message
                    if (index > 6) {
                        return
                    }

                    if (status.receiver.last_read_message_id === message.id) {
                        if (status.receiver_id !== currentUser?.id && messages[0].sender_id === currentUser?.id) {
                            return (
                                <UserAvatar
                                    key={index}
                                    src={status.receiver.avatar}
                                    size={14}
                                    className="my-1 mr-[1px]"
                                />
                            )
                        } else if (
                            status.receiver_id === currentUser?.id &&
                            messages[0].sender_id !== currentUser?.id
                        ) {
                            return (
                                <UserAvatar
                                    key={index}
                                    src={message.sender.avatar}
                                    size={14}
                                    className="my-1 mr-[1px]"
                                />
                            )
                        }
                    }
                })}
            </div>
        </div>
    )
}

export default MessageItem
