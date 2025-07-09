import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { mutate } from 'swr'

import ControlPanel from './components/ControlPanel'
import SearchMessage from './components/SearchMessage'
import { SocketEvent } from '~/enum/SocketEvent'
import SWRKey from '~/enum/SWRKey'
import socket from '~/helpers/socket'
import { ConversationModel } from '~/type/type'

interface InfoProps {
    className?: string
}

const Info: React.FC<InfoProps> = ({ className = '' }) => {
    const { uuid } = useParams()

    const [searchMode, setSearchMode] = useState(false)

    useEffect(() => {
        interface ConversationRenamedPayload {
            conversation_uuid: string
            conversation_name: string
        }

        const socketHandler = ({ conversation_uuid, conversation_name }: ConversationRenamedPayload) => {
            if (uuid === conversation_uuid) {
                mutate(
                    [SWRKey.GET_CONVERSATION_BY_UUID, uuid],
                    (prev: { data: ConversationModel } | undefined) => {
                        console.log(prev)

                        if (!prev) {
                            return prev
                        }

                        if (!prev?.data) {
                            return prev
                        }

                        return {
                            ...prev,
                            data: {
                                ...prev.data,
                                name: conversation_name,
                            },
                        }
                    },
                    {
                        revalidate: false,
                    },
                )
            }
        }

        socket.on(SocketEvent.CONVERSATION_RENAMED, socketHandler)

        return () => {
            socket.off(SocketEvent.CONVERSATION_RENAMED, socketHandler)
        }
    }, [uuid])

    return (
        <div
            id="info-container"
            className={`${className} min-h-[calc(100dvh-var(--header-mobile-height))] px-2 py-3 [overflow:overlay] sm:min-h-[calc(100dvh-var(--header-height))]`}
        >
            {searchMode ? <SearchMessage /> : <ControlPanel setSearchMode={setSearchMode} />}
        </div>
    )
}

export default Info
