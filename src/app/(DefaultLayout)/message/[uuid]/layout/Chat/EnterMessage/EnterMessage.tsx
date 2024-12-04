import { faSmile } from '@fortawesome/free-regular-svg-icons'
import { useEffect, useRef, useState } from 'react'
import { faImage } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { SendHorizontalIcon } from '~/components/Icons'
import { listenEvent } from '~/helpers/events'
import { useParams } from 'next/navigation'
import socket from '~/helpers/socket'
import { ChatEvent } from '~/enum/chat'

interface EnterMessageProps {
    className?: string
}

const EnterMessage: React.FC<EnterMessageProps> = ({ className = '' }) => {
    const { uuid } = useParams()
    const [messageValue, setMessageValue] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

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
                    ref={inputRef}
                    type="text"
                    className="w-full rounded-full bg-lightGray px-4 py-[6px] pr-12 outline-none dark:bg-[#333334]"
                    placeholder="Aa"
                    value={messageValue}
                    autoFocus
                    onChange={(e) => setMessageValue(e.target.value)}
                />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1 leading-[1px] hover:bg-gray-300 dark:hover:bg-darkGray">
                    <FontAwesomeIcon icon={faSmile} className="text-xl" />
                </button>
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
