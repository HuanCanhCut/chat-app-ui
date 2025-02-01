import { faEllipsisVertical, faShare } from '@fortawesome/free-solid-svg-icons'
import { faSmile } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@tippyjs/react'
import moment from 'moment-timezone'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import ReactModal from 'react-modal'

import { MessageModel, MessageStatus, UserModel } from '~/type/type'
import UserAvatar from '~/components/UserAvatar'
import useVisible from '~/hooks/useVisible'
import socket from '~/helpers/socket'
import { SocketEvent } from '~/enum/SocketEvent'
import { sendEvent } from '~/helpers/events'
import MessageImagesModel from './MessageImagesModel'

const BETWEEN_TIME_MESSAGE = 7 // minute

const MessageItem = ({
    message,
    messageIndex,
    messages,
    currentUser,
}: {
    message: MessageModel
    messageIndex: number
    messages: MessageModel[]
    currentUser: UserModel | undefined
}) => {
    const { uuid } = useParams()

    const options = { root: null, rootMargin: '0px', threshold: 0.5 }
    const firstMessageRef = useRef<HTMLDivElement>(null)
    const isFirstMessageVisible: boolean = useVisible(options, firstMessageRef)

    const [openImageModal, setOpenImageModal] = useState({
        isOpen: false,
        image: '',
    })

    useEffect(() => {
        if (isFirstMessageVisible) {
            // If haven't seen it, then emit
            if (message.id === messages[0].id) {
                for (const status of messages[0].message_status) {
                    // If have seen it, then skip it.
                    if (status.receiver_id === currentUser?.id && status.receiver.last_read_message_id === message.id) {
                        return
                    }
                }
            }

            socket.emit(SocketEvent.READ_MESSAGE, {
                conversationUuid: uuid as string,
                messageId: message.id,
            })

            sendEvent({ eventName: 'message:read-message', detail: uuid as string })
        }
    }, [isFirstMessageVisible, currentUser?.id, message.id, message.sender_id, uuid, messages])

    const diffTime =
        messageIndex > 0 &&
        Math.abs(
            moment
                .tz(messages[messageIndex].created_at, 'UTC')
                .diff(moment.tz(messages[messageIndex - 1].created_at, 'UTC'), 'minutes'),
        )

    const handleFormatTime = (time: Date) => {
        const isSameDay = moment(new Date(time)).isSame(moment(new Date()), 'day')
        const isSameWeek = moment(new Date(time)).isSame(moment(new Date()), 'week')

        if (isSameDay) return moment(new Date(time)).locale('vi').format('HH:mm')
        if (isSameWeek) return moment(new Date(time)).locale('vi').format('HH:mm ddd')

        return moment(new Date(time)).locale('vi').format('DD [Tháng] MM, YYYY')
    }

    const handleOpenImageModal = (url: string) => {
        if (url.startsWith('blob:http')) {
            return
        }

        setOpenImageModal({
            isOpen: true,
            image: url,
        })
    }

    const handleCloseImageModal = useCallback(() => {
        setOpenImageModal({
            isOpen: false,
            image: '',
        })
    }, [])

    const isOnlyIcon = message.type === 'text' && new RegExp(/^[^\w\s]+$/u).test(message.content.trim())

    return (
        <div>
            {message.type === 'image' && (
                <ReactModal
                    isOpen={openImageModal.isOpen}
                    ariaHideApp={false}
                    overlayClassName="overlay"
                    closeTimeoutMS={200}
                    onRequestClose={handleCloseImageModal}
                    className="fixed bottom-0 left-0 right-0 top-0"
                >
                    <MessageImagesModel onClose={handleCloseImageModal} imageUrl={openImageModal.image} />
                </ReactModal>
            )}
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
                    <React.Fragment>
                        {message.type === 'text' ? (
                            isOnlyIcon ? (
                                <p
                                    data-message-id={message.id}
                                    ref={messageIndex === 0 ? firstMessageRef : null}
                                    className={`w-fit max-w-[80%] rounded-3xl font-light [word-break:break-word]`}
                                >
                                    <span className="max-w-fit break-words text-3xl">{message.content}</span>
                                </p>
                            ) : (
                                <p
                                    data-message-id={message.id}
                                    ref={messageIndex === 0 ? firstMessageRef : null}
                                    className={`w-fit max-w-[80%] rounded-3xl px-4 py-1.5 font-light [word-break:break-word] ${
                                        message.sender_id === currentUser?.id
                                            ? 'bg-milk-tea text-white'
                                            : 'bg-lightGray text-black dark:bg-[#313233] dark:text-dark'
                                    }`}
                                >
                                    <span className="max-w-fit break-words">{message.content}</span>
                                </p>
                            )
                        ) : message.type === 'image' ? (
                            <div
                                className={`flex w-full ${JSON.parse(message.content).length > 1 ? 'max-w-[60%] sm:max-w-[55%] md:max-w-[50%] lg:max-w-[45%] xl:max-w-[40%]' : 'max-w-[60%] sm:max-w-[40%] md:max-w-[35%] lg:max-w-[30%] xl:max-w-[25%]'} flex-wrap gap-1 overflow-hidden rounded-3xl [word-break:break-word]`}
                            >
                                {JSON.parse(message.content).map((url: string, index: number) => (
                                    <div className="flex-1" key={index}>
                                        <Image
                                            src={url}
                                            alt="message"
                                            width={10000} // Avoid image breakage
                                            height={10000} // Avoid image breakage
                                            className={`sm:min-w-[150px] ${JSON.parse(message.content).length === 1 && 'min-w-[240px]'} h-full w-full min-w-[180px] cursor-pointer rounded-md object-cover`}
                                            priority
                                            quality={100}
                                            onClick={() => handleOpenImageModal(url)}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </React.Fragment>
                </Tippy>
            </div>

            <div className="flex justify-end pr-2">
                {message.message_status.map((status: MessageStatus, index: number) => {
                    // Only show 6 users who have read the message
                    if (index > 6) {
                        return
                    }

                    if (status.receiver.last_read_message_id !== message.id && status.status !== 'sending') {
                        return
                    }

                    if (
                        status.receiver.last_read_message_id === message.id &&
                        status.receiver_id !== currentUser?.id &&
                        status.status === 'read'
                    ) {
                        return (
                            <React.Fragment key={index}>
                                <Tippy
                                    content={`${status.receiver.full_name} đã xem lúc ${handleFormatTime(status.read_at)}`}
                                >
                                    <span>
                                        <UserAvatar src={status.receiver.avatar} size={14} className="my-1 ml-1" />
                                    </span>
                                </Tippy>
                            </React.Fragment>
                        )
                    }

                    if (status.receiver_id !== currentUser?.id) {
                        const statusMessages = {
                            sent: 'Đã gửi',
                            delivered: 'Đã nhận',
                            sending: 'Đang gửi',
                        }

                        const message = statusMessages[status.status as keyof typeof statusMessages]

                        if (message) {
                            return (
                                <p key={index} className="mt-[2px] text-xs font-light text-zinc-400">
                                    {message}
                                </p>
                            )
                        }
                    }
                })}
            </div>

            {/* Show time between two message if the time is greater than 7 minutes */}
            <p
                className={`my-3 text-center text-xs text-gray-400 ${Number(diffTime) < BETWEEN_TIME_MESSAGE ? 'hidden' : 'block'}`}
            >
                {messageIndex > 0 && handleFormatTime(messages[messageIndex - 1].created_at)}
            </p>
        </div>
    )
}

export default MessageItem
