import Tippy from '@tippyjs/react'
import moment from 'moment-timezone'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { memo } from 'react'

import { MessageModel, MessageResponse, UserModel } from '~/type/type'
import UserAvatar from '~/components/UserAvatar'
import useVisible from '~/hooks/useVisible'
import socket from '~/helpers/socket'
import { SocketEvent } from '~/enum/SocketEvent'
import { sendEvent } from '~/helpers/events'
import MessageImagesModel from '~/layouts/Chat/Message/Modal/MessageImagesModal'
import ReactionModal from '~/layouts/Chat/Message/Modal/ReactionModal'
import RevokeModal from '~/layouts/Chat/Message/Modal/RevokeModal'
import Modal from '~/components/Modal'
import ReplyMessage from './components/ReplyMessage'
import SystemMessage from '../SystemMessage'
import Viewed from './components/UserViewed'
import MessageAction from './components/MessageAction'
import MessageContent from './components/MessageContent'

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
                return Math.abs(moment.tz(message.created_at, 'UTC').diff(moment.tz(targetMessage.created_at, 'UTC'), 'minutes'))
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
                        <MessageContent
                            message={message}
                            messageIndex={messageIndex}
                            ref={firstMessageRef}
                            messageRef={messageRef}
                            currentUser={currentUser}
                            handleOpenImageModal={handleOpenImageModal}
                            handleOpenReactionModal={handleOpenReactionModal}
                            messages={messages}
                            diffTime={diffTime}
                        />
                    </Tippy>
                </div>
            </div>

            <Viewed message={message} currentUser={currentUser} messageIndex={messageIndex} handleFormatTime={handleFormatTime} />

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
