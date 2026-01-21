import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { EmojiClickData } from 'emoji-picker-react'

import { faSmile } from '@fortawesome/free-regular-svg-icons'
import { faEllipsisVertical, faReply } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@vendor/tippy'
import CustomTippy from '~/components/CustomTippy'
import Emoji from '~/components/Emoji'
import PopperWrapper from '~/components/PopperWrapper'
import { listenEvent, sendEvent } from '~/helpers/events'
import socket from '~/helpers/socket'
import { MessageModel, MessageResponse, UserModel } from '~/type/type'
import HeadlessTippy from '~/vendor/tippy/headless'

interface MessageActionProps {
    message: MessageModel
    currentUser: UserModel
    messageIndex: number
    messages: MessageResponse
    setOpenRevokeModal: React.Dispatch<React.SetStateAction<boolean>>
}

const MessageAction: React.FC<MessageActionProps> = ({
    message,
    currentUser,
    messageIndex,
    messages,
    setOpenRevokeModal,
}) => {
    const { uuid } = useParams()

    const tippyInstanceRef = useRef<any>(null)
    // open emoji-picker reaction
    const [isOpenReaction, setIsOpenReaction] = useState({
        reactionOpen: false,
        reactionWrapperOpen: false,
    })
    const [isOpenMoreAction, setIsOpenMoreAction] = useState(false)

    useEffect(() => {
        const remove = listenEvent('TIPPY:HIDE', () => {
            setIsOpenMoreAction(false)
        })

        return remove
    }, [])

    const renderMoreAction = () => {
        return (
            <PopperWrapper className="border-none! p-2!">
                <div className="flex w-32 flex-col text-sm font-medium">
                    <button
                        className="rounded-md p-2 text-left hover:bg-gray-100 dark:hover:bg-[#353738]"
                        onClick={handleOpenRevokeModal}
                    >
                        {/* if message is not revoked and sender is current user, show "Thu hồi", else show "Gỡ" */}
                        {message.content !== null && message.sender_id === currentUser?.id ? 'Thu hồi' : 'Gỡ'}
                    </button>
                </div>
            </PopperWrapper>
        )
    }

    const tippyShow = (instance: any) => {
        tippyInstanceRef.current = instance
        setIsOpenMoreAction(true)
    }

    const handleReply = () => {
        sendEvent('MESSAGE:REPLY', { message: messages.data[messageIndex] })
    }

    const handleOpenRevokeModal = () => {
        setOpenRevokeModal(true)
        tippyInstanceRef.current?.hide()
    }

    const handleOpenReaction = () => {
        setIsOpenReaction((prev) => ({
            ...prev,
            reactionOpen: true,
            reactionWrapperOpen: !prev.reactionWrapperOpen,
        }))
    }

    const handleChooseReaction = useCallback(
        (EmojiClickData: EmojiClickData) => {
            setIsOpenReaction((prev) => ({
                ...prev,
                reactionOpen: true,
                reactionWrapperOpen: false,
            }))

            socket.emit('REACT_MESSAGE', {
                conversation_uuid: uuid as string,
                message_id: message.id,
                react: EmojiClickData.unified,
                user_react_id: currentUser?.id,
            })
        },
        [currentUser?.id, message.id, uuid],
    )

    return (
        <div
            className={`flex items-center gap-[2px] sm:gap-2 ${!isOpenReaction.reactionWrapperOpen && !isOpenMoreAction ? 'opacity-0' : 'opacity-100'} group-hover:opacity-100 ${message.sender_id === currentUser?.id ? 'order-first mr-2' : 'order-last ml-2 flex-row-reverse'}`}
        >
            <CustomTippy renderItem={renderMoreAction} onShow={tippyShow} placement="top" offsetY={6}>
                <Tippy content="Xem thêm">
                    <button className="flex-center z-10 h-7 w-7 rounded-full bg-(--reply-message-light-background-color) text-black dark:bg-(--reply-message-dark-background-color) dark:text-white">
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                    </button>
                </Tippy>
            </CustomTippy>
            <Tippy content="Trả lời">
                <button
                    onClick={handleReply}
                    className="flex-center z-10 h-7 w-7 rounded-full bg-(--reply-message-light-background-color) text-black dark:bg-(--reply-message-dark-background-color) dark:text-white"
                >
                    <FontAwesomeIcon icon={faReply} />
                </button>
            </Tippy>

            <HeadlessTippy
                render={() => {
                    return (
                        <Emoji
                            onEmojiClick={handleChooseReaction}
                            isOpen={isOpenReaction.reactionOpen}
                            isReaction={true}
                            reactions={['2764-fe0f', '1f606', '1f62e', '1f622', '1f621', '1f44d']}
                        />
                    )
                }}
                onClickOutside={() =>
                    setIsOpenReaction((prev) => ({
                        ...prev,
                        reactionOpen: false,
                        reactionWrapperOpen: false,
                    }))
                }
                placement="top-start"
                offset={[0, 15]}
                interactive
                visible={isOpenReaction.reactionWrapperOpen}
            >
                <Tippy content="Bày tỏ cảm xúc">
                    <button
                        className="flex-center z-10 h-7 w-7 rounded-full bg-(--reply-message-light-background-color) text-black dark:bg-(--reply-message-dark-background-color) dark:text-white"
                        onClick={handleOpenReaction}
                    >
                        <FontAwesomeIcon icon={faSmile} />
                    </button>
                </Tippy>
            </HeadlessTippy>
        </div>
    )
}

export default MessageAction
