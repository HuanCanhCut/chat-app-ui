import { faEllipsisVertical, faShare } from '@fortawesome/free-solid-svg-icons'
import { faSmile } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@tippyjs/react'
import moment from 'moment-timezone'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import ReactModal from 'react-modal'

import CustomImage from '~/components/Image/Image'
import Emoji from '~/components/Emoji'
import { MessageModel, MessageResponse, MessageStatus, UserModel } from '~/type/type'
import UserAvatar from '~/components/UserAvatar'
import useVisible from '~/hooks/useVisible'
import socket from '~/helpers/socket'
import { SocketEvent } from '~/enum/SocketEvent'
import { sendEvent } from '~/helpers/events'
import MessageImagesModel from './Modal/MessageImagesModal'
import { KeyedMutator } from 'swr'
import ReactionModal from './Modal/ReactionModal'

const BETWEEN_TIME_MESSAGE = 7 // minute

interface MessageItemProps {
    message: MessageModel
    messageIndex: number
    messages: MessageResponse
    currentUser: UserModel | undefined
    mutateMessage: KeyedMutator<MessageResponse | undefined>
}

const MessageItem = ({ message, messageIndex, messages, currentUser }: MessageItemProps) => {
    const { uuid } = useParams()

    const options = { root: null, rootMargin: '0px', threshold: 0.5 }
    const firstMessageRef = useRef<HTMLDivElement>(null)
    const isFirstMessageVisible: boolean = useVisible(options, firstMessageRef)

    const [openImageModal, setOpenImageModal] = useState({
        isOpen: false,
        image: '',
        messageId: 0,
    })
    const [openReactionModal, setOpenReactionModal] = useState({
        isOpen: false,
        messageId: 0,
    })

    // open emoji-picker reaction
    const [isOpenReaction, setIsOpenReaction] = useState(false)

    useEffect(() => {
        if (isFirstMessageVisible) {
            // If haven't seen it, then emit
            if (message.id === messages.data[0].id) {
                for (const status of messages.data[0].message_status) {
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
                .tz(messages.data[messageIndex].created_at, 'UTC')
                .diff(moment.tz(messages.data[messageIndex - 1].created_at, 'UTC'), 'minutes'),
        )

    const handleFormatTime = (time: Date) => {
        const isSameDay = moment(new Date(time)).isSame(moment(new Date()), 'day')
        const isSameWeek = moment(new Date(time)).isSame(moment(new Date()), 'week')

        if (isSameDay) return moment(new Date(time)).locale('vi').format('HH:mm')
        if (isSameWeek) return moment(new Date(time)).locale('vi').format('HH:mm ddd')

        return moment(new Date(time)).locale('vi').format('DD [Tháng] MM, YYYY')
    }

    const handleOpenImageModal = (url: string, messageId: number) => {
        if (url.startsWith('blob:http')) {
            return
        }

        setOpenImageModal({
            isOpen: true,
            image: url,
            messageId,
        })
    }

    const handleCloseImageModal = useCallback(() => {
        setOpenImageModal({
            isOpen: false,
            image: '',
            messageId: 0,
        })
    }, [])

    const isOnlyIcon =
        message.type === 'text' &&
        new RegExp(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base})+$/u).test(message.content.trim())

    const handleOpenReaction = () => {
        setIsOpenReaction(!isOpenReaction)
    }

    const handleChooseReaction = () => {
        setIsOpenReaction(false)
    }

    const handleCloseReactionModal = useCallback(() => {
        setOpenReactionModal({
            isOpen: false,
            messageId: 0,
        })
    }, [])

    const handleOpenReactionModal = (messageId: number) => {
        setOpenReactionModal({
            isOpen: true,
            messageId,
        })
    }

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

            <ReactModal
                isOpen={openReactionModal.isOpen}
                ariaHideApp={false}
                overlayClassName="overlay"
                closeTimeoutMS={200}
                onRequestClose={handleCloseReactionModal}
                className="modal"
            >
                <ReactionModal onClose={handleCloseReactionModal} messageId={openReactionModal.messageId} />
            </ReactModal>

            <div
                className={`group relative flex w-full items-center gap-3 ${message?.top_reaction && 'mb-[10px]'} ${message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
            >
                <div
                    className={`flex items-center gap-2 ${!isOpenReaction && 'opacity-0'} transition-opacity duration-100 group-hover:opacity-100 ${message.sender_id === currentUser?.id ? 'order-first' : 'order-last flex-row-reverse'}`}
                >
                    <button className="flex-center h-7 w-7 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-500 dark:hover:bg-zinc-800">
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                    </button>
                    <button className="flex-center h-7 w-7 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-500 dark:hover:bg-zinc-800">
                        <FontAwesomeIcon icon={faShare} />
                    </button>
                    <Emoji
                        isOpen={isOpenReaction}
                        placement="top-start"
                        setIsOpen={setIsOpenReaction}
                        onEmojiClick={handleChooseReaction}
                        isReaction={true}
                    >
                        <button
                            className="flex-center h-7 w-7 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-500 dark:hover:bg-zinc-800"
                            onClick={handleOpenReaction}
                        >
                            <FontAwesomeIcon icon={faSmile} />
                        </button>
                    </Emoji>
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
                                className={`flex w-full ${
                                    JSON.parse(message.content).length > 1
                                        ? 'max-w-[60%] sm:max-w-[55%] md:max-w-[50%] lg:max-w-[45%] xl:max-w-[40%]'
                                        : 'max-w-[60%] sm:max-w-[40%] md:max-w-[35%] lg:max-w-[30%] xl:max-w-[25%]'
                                } flex-wrap gap-1 overflow-hidden rounded-3xl [word-break:break-word]`}
                            >
                                {JSON.parse(message.content).map((url: string, index: number) => (
                                    <div className="flex-1" key={index}>
                                        <CustomImage
                                            src={url}
                                            alt="message"
                                            className={`max-h-[260px] sm:min-w-[150px] ${JSON.parse(message.content).length === 1 && 'min-w-[240px]'} h-full w-full min-w-[180px] cursor-pointer rounded-md object-cover`}
                                            priority
                                            quality={100}
                                            onClick={() => handleOpenImageModal(url, message.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </React.Fragment>
                </Tippy>

                {/* Show reaction */}
                <Tippy
                    content={
                        <div>
                            {message?.top_reaction?.map((reaction, index) => {
                                return (
                                    <p className="font-light leading-5" key={index}>
                                        {reaction.user_reaction_name}
                                    </p>
                                )
                            })}

                            {message?.total_reactions > 2 && (
                                <p className="font-light leading-5">và {message?.total_reactions - 2} người khác...</p>
                            )}
                        </div>
                    }
                >
                    <div
                        className="absolute right-1 top-3/4 flex cursor-pointer items-center rounded-full bg-white py-[2px] shadow-sm shadow-zinc-300 dark:bg-zinc-800 dark:shadow-zinc-700"
                        onClick={() => {
                            handleOpenReactionModal(message.id)
                        }}
                    >
                        {message?.top_reaction?.map((reaction, index) => {
                            return (
                                <span className="text-sm leading-none" key={index}>
                                    {reaction.react}
                                </span>
                            )
                        })}
                        {message?.total_reactions !== 0 && (
                            <span className="mx-1 text-xs leading-none text-gray-500 dark:text-zinc-400">
                                {message?.total_reactions}
                            </span>
                        )}
                    </div>
                </Tippy>
            </div>

            <div className={`flex justify-end pr-2`}>
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
                {messageIndex > 0 && handleFormatTime(messages.data[messageIndex - 1].created_at)}
            </p>
        </div>
    )
}

export default MessageItem
