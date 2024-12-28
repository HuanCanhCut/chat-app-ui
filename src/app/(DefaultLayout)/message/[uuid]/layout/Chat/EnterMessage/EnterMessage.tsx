import { faSmile } from '@fortawesome/free-regular-svg-icons'
import { useEffect, useState } from 'react'
import { faImage } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Emoji from '~/components/Emoji'

import { SendHorizontalIcon } from '~/components/Icons'
import { listenEvent } from '~/helpers/events'
import { useParams } from 'next/navigation'
import socket from '~/helpers/socket'
import { ChatEvent } from '~/enum/socket/chat'
import { EmojiClickData } from 'emoji-picker-react'
import Tippy from '@tippyjs/react'

interface EnterMessageProps {
    className?: string
}

const EnterMessage: React.FC<EnterMessageProps> = ({ className = '' }) => {
    const { uuid } = useParams()

    const [messageValue, setMessageValue] = useState('')
    const [isOpenEmoji, setIsOpenEmoji] = useState(false)

    const handleEnterMessage = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            handleEmitMessage(uuid as string)
        }
    }

    const handleEmitMessage = (conversationUuid: string) => {
        if (!uuid) return
        if (!messageValue.trim().length) return

        socket.emit(ChatEvent.NEW_MESSAGE, { conversationUuid, message: messageValue })

        setMessageValue('')
    }

    const handleToggleEmoji = () => {
        setIsOpenEmoji(!isOpenEmoji)
    }

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        console.log(emojiData.imageUrl)
        setMessageValue((prev) => prev + emojiData.emoji)
    }

    useEffect(() => {
        const remove = listenEvent({
            eventName: 'message:enter-message',
            handler: ({ detail: conversationUuid }) => {
                handleEmitMessage(conversationUuid as string)
            },
        })

        return () => remove()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className={`${className} flex items-center justify-between gap-2 p-2 pb-4`} onKeyDown={handleEnterMessage}>
            <div className="flex cursor-pointer items-center p-2">
                <FontAwesomeIcon icon={faImage} className="text-xl" />
            </div>
            <div className="relative flex flex-grow">
                <input
                    type="text"
                    className="w-full rounded-full bg-lightGray px-4 py-[6px] pr-12 outline-none dark:bg-[#333334]"
                    placeholder="Aa"
                    value={messageValue}
                    autoFocus
                    onChange={(e) => setMessageValue(e.target.value)}
                />
                <Emoji isOpen={isOpenEmoji} setIsOpen={setIsOpenEmoji} onEmojiClick={handleEmojiClick}>
                    <Tippy content="Chọn biểu tượng cảm xúc">
                        <button
                            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1 leading-[1px] hover:bg-gray-300 dark:hover:bg-darkGray"
                            onClick={handleToggleEmoji}
                        >
                            <FontAwesomeIcon icon={faSmile} className="text-xl" />
                        </button>
                    </Tippy>
                </Emoji>
            </div>
            {messageValue.length ? (
                <button
                    className="rounded-full p-2 hover:bg-lightGray dark:hover:bg-darkGray"
                    onClick={() => handleEmitMessage(uuid as string)}
                >
                    <SendHorizontalIcon />
                </button>
            ) : (
                <button className="text-xl">🤣</button>
            )}
        </div>
    )
}

export default EnterMessage
