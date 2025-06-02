import { faEllipsisVertical, faReply } from '@fortawesome/free-solid-svg-icons'
import { faSmile } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@tippyjs/react'
import moment from 'moment-timezone'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { memo } from 'react'
import CustomImage from '~/components/Image/Image'
import Emoji from '~/components/Emoji'
import { MessageModel, MessageResponse, MessageStatus, UserModel } from '~/type/type'
import UserAvatar from '~/components/UserAvatar'
import useVisible from '~/hooks/useVisible'
import socket from '~/helpers/socket'
import { SocketEvent } from '~/enum/SocketEvent'
import { listenEvent, sendEvent } from '~/helpers/events'
import MessageImagesModel from '../Modal/MessageImagesModal'
import ReactionModal from '../Modal/ReactionModal'
import { EmojiClickData } from 'emoji-picker-react'
import Reaction from './Reaction'
import CustomTippy from '~/components/CustomTippy'
import PopperWrapper from '~/components/PopperWrapper'
import RevokeModal from '../Modal/RevokeModal'
import Modal from '~/components/Modal'
import ReplyMessage from './ReplyMessage'
import SystemMessage from './SystemMessage'

const BETWEEN_TIME_MESSAGE = 7 // minute

interface MessageRef {
    [key: string]: HTMLDivElement
}

interface MessageItemProps {
    message: MessageModel
    messageIndex: number
    messages: MessageResponse
    currentUser: UserModel
    messageRefs: MessageRef
    // eslint-disable-next-line no-unused-vars
    messageRef: (el: HTMLDivElement) => void
    offsetRange: { start: number; end: number }
    // eslint-disable-next-line no-unused-vars
    setOffsetRange: React.Dispatch<
        React.SetStateAction<{
            start: number
            end: number
        }>
    >
}

const MessageItem = ({
    message,
    messageIndex,
    messages,
    currentUser,
    messageRefs,
    messageRef,
    offsetRange,
    setOffsetRange,
}: MessageItemProps) => {
    const { uuid } = useParams()

    const options = { root: null, rootMargin: '0px', threshold: 0.5 }
    const firstMessageRef = useRef<HTMLDivElement>(null)
    const isFirstMessageVisible: boolean = useVisible(options, firstMessageRef)

    const tippyInstanceRef = useRef<any>(null)
    const replyMessageRef = useRef<HTMLDivElement>(null)
    const groupMessageRef = useRef<HTMLDivElement>(null)

    const [openImageModal, setOpenImageModal] = useState({
        isOpen: false,
        image: '',
        messageId: 0,
    })
    const [openReactionModal, setOpenReactionModal] = useState({
        isOpen: false,
        messageId: 0,
    })

    const [openRevokeModal, setOpenRevokeModal] = useState(false)

    // open emoji-picker reaction
    const [isOpenReaction, setIsOpenReaction] = useState(false)
    const [isOpenMoreAction, setIsOpenMoreAction] = useState(false)

    // handle margin top of reply message
    useEffect(() => {
        if (message.parent) {
            if (replyMessageRef.current && groupMessageRef.current) {
                groupMessageRef.current.style.marginTop = replyMessageRef.current.offsetHeight + 'px'
            }
        } else {
            // reset margin top when message has no parent
            if (groupMessageRef.current) {
                groupMessageRef.current.style.marginTop = '0px'
            }
        }
    }, [message.parent])

    const diffTime =
        messageIndex > 0 && !messages.data[messageIndex - 1].type.startsWith('system')
            ? Math.abs(
                  moment
                      .tz(messages.data[messageIndex].created_at, 'UTC')
                      .diff(moment.tz(messages.data[messageIndex - 1].created_at, 'UTC'), 'minutes'),
              )
            : 0

    useEffect(() => {
        if (isFirstMessageVisible) {
            let isRead = true

            const firstMessage = messages.data[0]

            if (message.id === firstMessage.id && messages.meta.pagination.offset === 0) {
                if (firstMessage.type.startsWith('system') && firstMessage.is_read) {
                    return
                }

                for (const status of firstMessage.message_status) {
                    if (status.receiver_id === currentUser?.id && status.receiver.last_read_message_id !== message.id) {
                        isRead = false
                        break
                    }
                }
            }

            if (!isRead) {
                // if user is not in another tab, then send event to server
                if (document.visibilityState === 'visible') {
                    socket.emit(SocketEvent.READ_MESSAGE, {
                        conversationUuid: uuid as string,
                        messageId: message.id,
                    })
                    sendEvent({ eventName: 'message:read-message', detail: uuid as string })
                }
            }
        }
    }, [currentUser?.id, isFirstMessageVisible, message.id, messages.data, messages.meta.pagination.offset, uuid])

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

    const handleOpenReaction = () => {
        setIsOpenReaction(!isOpenReaction)
    }

    const handleChooseReaction = (EmojiClickData: EmojiClickData) => {
        setIsOpenReaction(false)

        socket.emit(SocketEvent.REACT_MESSAGE, {
            conversation_uuid: uuid as string,
            message_id: message.id,
            react: EmojiClickData.emoji,
            user_react_id: currentUser?.id,
        })
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

    const handleOpenRevokeModal = () => {
        setOpenRevokeModal(true)
        tippyInstanceRef.current?.hide()
    }

    const handleCloseRevokeModal = useCallback(() => {
        setOpenRevokeModal(false)
    }, [])

    const renderMoreAction = () => {
        return (
            <PopperWrapper className="!border-none !p-2">
                <div className="flex w-32 flex-col text-sm font-medium">
                    <button
                        className="rounded-md p-2 text-left hover:bg-gray-100 dark:hover:bg-[#353738]"
                        onClick={handleOpenRevokeModal}
                    >
                        {/* if message is not revoked and sender is current user, show "Thu hồi", else show "Gỡ" */}
                        {message.content !== null && message.sender_id === currentUser?.id ? 'Thu hồi' : 'Gỡ'}
                    </button>
                    <button className="rounded-md p-2 text-left hover:bg-gray-100 dark:hover:bg-[#353738]">
                        Chuyển tiếp
                    </button>
                </div>
            </PopperWrapper>
        )
    }

    const tippyShow = (instance: any) => {
        tippyInstanceRef.current = instance
        setIsOpenMoreAction(true)
    }

    useEffect(() => {
        const remove = listenEvent({
            eventName: 'tippy:tippy-hidden',
            handler: () => {
                setIsOpenMoreAction(false)
            },
        })

        return remove
    }, [])

    const handleReply = () => {
        sendEvent({ eventName: 'message:reply', detail: messages.data[messageIndex] })
    }

    if (message.type.startsWith('system')) {
        return <SystemMessage message={message} messageIndex={messageIndex} ref={firstMessageRef} />
    }

    return (
        <div>
            {message.type === 'image' && (
                <Modal
                    isOpen={openImageModal.isOpen}
                    onClose={handleCloseImageModal}
                    overlayClassName="overlay"
                    className="fixed bottom-0 left-0 right-0 top-0"
                >
                    <MessageImagesModel onClose={handleCloseImageModal} imageUrl={openImageModal.image} />
                </Modal>
            )}

            <Modal isOpen={openReactionModal.isOpen} onClose={handleCloseReactionModal}>
                <ReactionModal onClose={handleCloseReactionModal} messageId={openReactionModal.messageId} />
            </Modal>

            <Modal isOpen={openRevokeModal} onClose={handleCloseRevokeModal}>
                <RevokeModal message={message} onClose={handleCloseRevokeModal} />
            </Modal>

            <div ref={groupMessageRef} className={`group relative flex w-full items-end gap-3`}>
                {message.sender_id !== currentUser?.id && <UserAvatar src={message.sender.avatar} size={28} />}
                <div
                    className={`relative flex w-full items-center ${message?.top_reactions ? 'mb-[10px]' : ''} ${message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                >
                    {message.parent && (
                        <ReplyMessage
                            message={message}
                            currentUser={currentUser}
                            ref={replyMessageRef}
                            messageRefs={messageRefs}
                            offsetRange={offsetRange}
                            setOffsetRange={setOffsetRange}
                        />
                    )}
                    {/* More action */}
                    <div
                        className={`mx-3 flex items-center gap-2 ${!isOpenReaction && !isOpenMoreAction ? 'opacity-0' : 'opacity-100'} group-hover:opacity-100 ${message.sender_id === currentUser?.id ? 'order-first' : 'order-last flex-row-reverse'}`}
                    >
                        <CustomTippy renderItem={renderMoreAction} onShow={tippyShow} placement="top" offsetY={6}>
                            <Tippy content="Xem thêm">
                                <button className="flex-center z-10 h-7 w-7 rounded-full bg-[#feeace] text-black dark:bg-[#6b6b6b] dark:text-white">
                                    <FontAwesomeIcon icon={faEllipsisVertical} />
                                </button>
                            </Tippy>
                        </CustomTippy>
                        <Tippy content="Trả lời">
                            <button
                                onClick={handleReply}
                                className="flex-center z-10 h-7 w-7 rounded-full bg-[#feeace] text-black dark:bg-[#6b6b6b] dark:text-white"
                            >
                                <FontAwesomeIcon icon={faReply} />
                            </button>
                        </Tippy>
                        <Emoji
                            isOpen={isOpenReaction}
                            placement="top-start"
                            setIsOpen={setIsOpenReaction}
                            onEmojiClick={handleChooseReaction}
                            isReaction={true}
                        >
                            <Tippy content="Bày tỏ cảm xúc">
                                <button
                                    className="flex-center z-10 h-7 w-7 rounded-full bg-[#feeace] text-black dark:bg-[#6b6b6b] dark:text-white"
                                    onClick={handleOpenReaction}
                                >
                                    <FontAwesomeIcon icon={faSmile} />
                                </button>
                            </Tippy>
                        </Emoji>
                    </div>

                    {/* Message content */}
                    <Tippy content={handleFormatTime(message.created_at)} placement="left">
                        <>
                            {/* if message is not revoked */}
                            {message.content !== null ? (
                                message.type === 'text' ? (
                                    <div
                                        ref={messageIndex === 0 ? firstMessageRef : messageRef}
                                        className={`relative w-fit max-w-[80%] rounded-3xl px-4 py-1.5 font-light [word-break:break-word] ${
                                            message.sender_id === currentUser?.id
                                                ? 'bg-milk-tea text-white'
                                                : 'bg-lightGray text-black dark:bg-[#313233] dark:text-dark'
                                        }`}
                                    >
                                        <span className="max-w-fit break-words">{message.content}</span>

                                        <Reaction message={message} handleOpenReactionModal={handleOpenReactionModal} />
                                    </div>
                                ) : message.type === 'image' ? (
                                    <div
                                        ref={messageIndex === 0 ? firstMessageRef : messageRef}
                                        className={`relative w-full rounded-2xl ${
                                            JSON.parse(message.content).length > 1
                                                ? 'max-w-[60%] sm:max-w-[55%] md:max-w-[50%] lg:max-w-[45%] xl:max-w-[35%]'
                                                : 'max-w-[60%] sm:max-w-[40%] md:max-w-[35%] lg:max-w-[30%] xl:max-w-[25%]'
                                        }`}
                                    >
                                        <div
                                            className={`flex w-full flex-wrap gap-1 overflow-hidden rounded-2xl [word-break:break-word]`}
                                        >
                                            {JSON.parse(message.content).map((url: string, index: number) => (
                                                <div className="flex-1" key={index}>
                                                    <CustomImage
                                                        src={url}
                                                        alt="message"
                                                        className={`max-h-[260px] sm:min-w-[150px] ${JSON.parse(message.content as string).length === 1 ? 'min-w-[240px]' : 'aspect-square'} h-full w-full min-w-[180px] cursor-pointer rounded-md object-cover`}
                                                        priority
                                                        quality={100}
                                                        onClick={() => handleOpenImageModal(url, message.id)}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <Reaction message={message} handleOpenReactionModal={handleOpenReactionModal} />
                                    </div>
                                ) : (
                                    // if message is icon
                                    <div
                                        ref={messageIndex === 0 ? firstMessageRef : messageRef}
                                        className={`relative w-fit max-w-[80%] rounded-3xl font-light [word-break:break-word]`}
                                    >
                                        <span className="max-w-fit break-words text-3xl">{message.content}</span>

                                        <Reaction message={message} handleOpenReactionModal={handleOpenReactionModal} />
                                    </div>
                                )
                            ) : (
                                // if message is revoked
                                <p
                                    ref={messageIndex === 0 ? firstMessageRef : messageRef}
                                    className={`relative w-fit max-w-[80%] rounded-3xl px-4 py-1.5 font-light italic opacity-85 [word-break:break-word] ${
                                        message.sender_id === currentUser?.id
                                            ? 'bg-milk-tea text-zinc-300'
                                            : 'bg-lightGray text-zinc-600 dark:bg-[#313233] dark:text-zinc-400'
                                    }`}
                                >
                                    {message.sender.id === currentUser?.id ? 'Bạn ' : `${message.sender.full_name} `}
                                    đã thu hồi một tin nhắn
                                </p>
                            )}
                        </>
                    </Tippy>
                </div>
            </div>

            <div className={`flex justify-end pr-2`}>
                {message.message_status.slice(0, 6).map((status: MessageStatus, index: number) => {
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
                                        <UserAvatar
                                            src={status.receiver.avatar}
                                            size={14}
                                            className="my-1 ml-1 cursor-default"
                                        />
                                    </span>
                                </Tippy>
                            </React.Fragment>
                        )
                    }

                    return null
                })}
                {messageIndex === 0 && message.sender_id === currentUser?.id && (
                    <>
                        {(() => {
                            // find latest status of message that is not current user
                            const latestStatus = message.message_status.find(
                                (status) => status.receiver_id !== currentUser?.id,
                            )

                            if (latestStatus) {
                                const statusMessages = {
                                    sent: 'Đã gửi',
                                    delivered: 'Đã nhận',
                                    sending: 'Đang gửi',
                                }

                                const statusText = statusMessages[latestStatus.status as keyof typeof statusMessages]

                                if (statusText) {
                                    return <p className="mt-[2px] text-xs font-light text-zinc-400">{statusText}</p>
                                }
                            }

                            return null
                        })()}
                    </>
                )}
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

export default memo(MessageItem)
