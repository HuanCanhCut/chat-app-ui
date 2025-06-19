import Tippy from '@tippyjs/react'
import moment from 'moment-timezone'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { memo } from 'react'

import CustomImage from '~/components/Image/Image'
import { MessageModel, MessageResponse, UserModel } from '~/type/type'
import UserAvatar from '~/components/UserAvatar'
import useVisible from '~/hooks/useVisible'
import socket from '~/helpers/socket'
import { SocketEvent } from '~/enum/SocketEvent'
import { sendEvent } from '~/helpers/events'
import MessageImagesModel from '~/layouts/Chat/Message/Modal/MessageImagesModal'
import ReactionModal from '~/layouts/Chat/Message/Modal/ReactionModal'
import Reaction from './components/Reaction'
import RevokeModal from '~/layouts/Chat/Message/Modal/RevokeModal'
import Modal from '~/components/Modal'
import ReplyMessage from './components/ReplyMessage'
import SystemMessage from '../SystemMessage'
import Viewed from './components/UserViewed'
import MessageAction from './components/MessageAction'

const BETWEEN_TIME_MESSAGE = 7 // minute

interface MessageRef {
    [key: string]: HTMLDivElement
}

interface MessageItemProps {
    message: MessageModel & { is_preview?: boolean }
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

    const diffTime = (message: MessageModel, targetMessage: MessageModel) => {
        if (messageIndex > 0) {
            if (!targetMessage.type.startsWith('system')) {
                return Math.abs(
                    moment.tz(message.created_at, 'UTC').diff(moment.tz(targetMessage.created_at, 'UTC'), 'minutes'),
                )
            }

            return 0
        }

        return 0
    }

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
                    if (message.is_preview) {
                        return
                    }

                    socket.emit(SocketEvent.READ_MESSAGE, {
                        conversation_uuid: uuid as string,
                        message_id: message.id,
                    })
                    sendEvent({ eventName: 'message:read-message', detail: uuid as string })
                }
            }
        }
    }, [currentUser?.id, isFirstMessageVisible, message, messages.data, messages.meta.pagination.offset, uuid])

    const handleFormatTime = useCallback((time: Date) => {
        const isSameDay = moment(new Date(time)).isSame(moment(new Date()), 'day')
        const isSameWeek = moment(new Date(time)).isSame(moment(new Date()), 'week')

        if (isSameDay) return moment(new Date(time)).locale('vi').format('HH:mm')
        if (isSameWeek) return moment(new Date(time)).locale('vi').format('HH:mm ddd')

        return moment(new Date(time)).locale('vi').format('DD [Tháng] MM, YYYY')
    }, [])

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

    const handleCloseRevokeModal = useCallback(() => {
        setOpenRevokeModal(false)
    }, [])

    if (message.type.startsWith('system')) {
        return <SystemMessage message={message} messageIndex={messageIndex} ref={firstMessageRef} />
    }

    const consecutiveMessageStyle = () => {
        let style = ''

        // Nếu là tin nhắn đầu tiên, cuối cùng, system hoặc có parent thì không cần style
        if (message.type.startsWith('system')) {
            return ''
        }

        const isCurrentUser = message.sender_id === currentUser?.id

        if (messageIndex >= messages.data.length - 1) {
            if (
                messages.data[messageIndex - 1].sender_id === message.sender_id &&
                diffTime(message, messages.data[messageIndex - 1]) < BETWEEN_TIME_MESSAGE
            ) {
                style += isCurrentUser ? ' rounded-br-[6px]' : ' rounded-bl-[6px]'
            }

            return style
        }

        const nextMessage = messages.data[messageIndex + 1]
        const isConsecutiveWithNext =
            nextMessage.sender_id === message.sender_id && diffTime(message, nextMessage) < BETWEEN_TIME_MESSAGE

        if (messageIndex === 0) {
            if (isConsecutiveWithNext) {
                style += isCurrentUser ? ' rounded-tr-[6px]' : ' rounded-tl-[6px]'
            }

            return style
        }

        const prevMessage = messages.data[messageIndex - 1]

        const isConsecutiveWithPrev =
            prevMessage.sender_id === message.sender_id && diffTime(message, prevMessage) < BETWEEN_TIME_MESSAGE

        if (message.parent) {
            if (prevMessage.parent) {
                return
            }
        }

        // Style for consecutive message with previous message
        if (isConsecutiveWithPrev) {
            style += isCurrentUser ? ' rounded-br-[6px]' : ' rounded-bl-[6px]'
        }

        // Style for consecutive message with next message
        if (isConsecutiveWithNext) {
            style += isCurrentUser ? ' rounded-tr-[6px]' : ' rounded-tl-[6px]'
        }

        // Style for first message in a group
        if (!isConsecutiveWithPrev && isConsecutiveWithNext) {
            style += isCurrentUser ? ' rounded-tr-[6px]' : ' rounded-tl-[6px]'
        }

        return style
    }

    const isLastMessageInConsecutiveGroup = () => {
        if (message.type.startsWith('system')) {
            return true
        }

        if (messageIndex >= messages.data.length - 1) {
            return true
        }

        const prevMessage = messages.data[messageIndex - 1]

        if (prevMessage) {
            const isConsecutiveWithPrev =
                prevMessage.sender_id === message.sender_id && diffTime(message, prevMessage) < BETWEEN_TIME_MESSAGE

            return !isConsecutiveWithPrev
        }

        return true
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
                {message.sender_id !== currentUser?.id && (
                    <UserAvatar
                        className={`${!isLastMessageInConsecutiveGroup() ? 'invisible' : 'visible'}`}
                        src={message.sender.avatar}
                        size={28}
                    />
                )}
                <div
                    className={`relative flex w-full items-center ${message?.top_reactions?.length ? 'mb-[10px]' : ''} ${message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
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
                    <MessageAction
                        message={message}
                        currentUser={currentUser}
                        messageIndex={messageIndex}
                        messages={messages}
                        setOpenRevokeModal={setOpenRevokeModal}
                    />
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
                                        } ${consecutiveMessageStyle()}`}
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
                                            className={`flex w-full flex-wrap gap-1 overflow-hidden rounded-2xl [word-break:break-word] ${consecutiveMessageStyle()}`}
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
                                    } ${consecutiveMessageStyle()}`}
                                >
                                    {message.sender.id === currentUser?.id ? 'Bạn ' : `${message.sender.full_name} `}
                                    đã thu hồi một tin nhắn
                                </p>
                            )}
                        </>
                    </Tippy>
                </div>
            </div>

            <Viewed
                message={message}
                currentUser={currentUser}
                messageIndex={messageIndex}
                handleFormatTime={handleFormatTime}
            />

            {/* Show time between two message if the time is greater than 7 minutes */}
            <p
                className={`my-3 text-center text-xs text-gray-400 ${diffTime(message, messages.data[messageIndex - 1]) < BETWEEN_TIME_MESSAGE ? 'hidden' : 'block'}`}
            >
                {messageIndex > 0 && handleFormatTime(messages.data[messageIndex - 1].created_at)}
            </p>
        </div>
    )
}

export default memo(MessageItem)
