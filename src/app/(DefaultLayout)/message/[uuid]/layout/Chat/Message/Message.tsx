import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

import * as messageServices from '~/services/message'
import { ChatEvent } from '~/enum/chat'
import SWRKey from '~/enum/SWRKey'
import { sendEvent } from '~/helpers/events'
import socket from '~/helpers/socket'
import getCurrentUser from '~/zustand/getCurrentUser'

const Message: React.FC = () => {
    const { uuid } = useParams()
    const { currentUser } = getCurrentUser()

    const [page, setPage] = useState(1)

    const { data: messages } = useSWR(uuid ? [SWRKey.GET_MESSAGES, uuid] : null, () => {
        return messageServices.getMessages({ conversationUuid: uuid as string, page: page })
    })

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
        <div className="flex-grow overflow-hidden" onKeyDown={handleEnterMessage}>
            <div className="flex h-full max-h-full flex-col-reverse gap-1 overflow-y-auto px-3 pb-4">
                {messages?.data.map((message) => (
                    <p
                        className={`max-w-fit rounded-3xl px-4 py-1.5 font-light text-white ${
                            message.sender_id === currentUser?.data?.id
                                ? 'bg-milk-tea self-end'
                                : 'self-start bg-[#313233]'
                        }`}
                        key={message.id}
                    >
                        {message.content}
                    </p>
                ))}
            </div>
        </div>
    )
}

export default Message
