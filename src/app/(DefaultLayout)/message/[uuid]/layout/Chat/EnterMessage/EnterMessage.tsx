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
            if (!uuid) return
            if (!messageValue.trim().length) return

            handleEmitMessage(uuid as string)

            if (inputRef.current) {
                inputRef.current.value = ''
            }
        }
    }

    const handleEmitMessage = (conversationUuid: string) => {
        socket.emit(ChatEvent.NEW_MESSAGE, { conversationUuid, message: messageValue })
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
        <div
            className={`${className} flex items-center justify-between gap-3 px-4 py-2 pb-4`}
            onKeyDown={handleEnterMessage}
        >
            <div className="flex items-center">
                <FontAwesomeIcon icon={faImage} className="cursor-pointer text-xl" />
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
                <button className="absolute right-3 top-1/2 -translate-y-1/2 leading-[1px]">
                    <FontAwesomeIcon icon={faSmile} className="text-xl" />
                </button>
            </div>
            {messageValue.length ? <SendHorizontalIcon /> : <button className="text-xl">🤣</button>}
        </div>
    )
}

export default EnterMessage
