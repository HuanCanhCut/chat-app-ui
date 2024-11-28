import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { ChatEvent } from '~/enum/chat'
import { sendEvent } from '~/helpers/events'
import socket from '~/helpers/socket'

interface MessageProps {
    className?: string
}

const Message: React.FC<MessageProps> = ({ className = '' }) => {
    const { uuid } = useParams()

    // Join room when component mount
    useEffect(() => {
        socket.emit(ChatEvent.JOIN_ROOM, uuid)
    }, [uuid])

    const handleEnterMessage = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            sendEvent({ eventName: 'message:enter-message', detail: { roomUuid: uuid } })
        }
    }

    return (
        <div className={`${className} [overflow-y:overlay]`} onKeyDown={handleEnterMessage}>
            Message
        </div>
    )
}

export default Message
