import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { mutate } from 'swr'

import ControlPanel from './components/ControlPanel'
import SearchMessage from './components/SearchMessage'
import { SocketEvent } from '~/enum/SocketEvent'
import SWRKey from '~/enum/SWRKey'
import socket from '~/helpers/socket'
import { ConversationModel, ConversationThemeModel } from '~/type/type'

interface InfoProps {
    className?: string
}

const sharedSocketEvents = [
    SocketEvent.CONVERSATION_RENAMED,
    SocketEvent.CONVERSATION_AVATAR_CHANGED,
    SocketEvent.CONVERSATION_THEME_CHANGED,
    SocketEvent.CONVERSATION_EMOJI_CHANGED,
]

const Info: React.FC<InfoProps> = ({ className = '' }) => {
    const { uuid } = useParams()

    const [searchMode, setSearchMode] = useState(false)

    useEffect(() => {
        interface ConversationRenamedPayload {
            conversation_uuid: string
            value: string | ConversationThemeModel
            key: 'name' | 'avatar' | 'theme' | 'emoji'
        }

        const socketHandler = ({ conversation_uuid, key, value }: ConversationRenamedPayload) => {
            if (uuid === conversation_uuid) {
                mutate(
                    [SWRKey.GET_CONVERSATION_BY_UUID, uuid],
                    (prev: { data: ConversationModel } | undefined) => {
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
                                [key]: value,
                            },
                        }
                    },
                    {
                        revalidate: false,
                    },
                )
            }
        }

        sharedSocketEvents.forEach((event) => {
            socket.on(event, socketHandler)
        })

        return () => {
            sharedSocketEvents.forEach((event) => {
                socket.off(event, socketHandler)
            })
        }
    }, [uuid])

    useEffect(() => {
        interface ConversationRenamedPayload {
            conversation_uuid: string
            member_id: number
            nickname: string
        }

        const socketHandler = ({ conversation_uuid, member_id, nickname }: ConversationRenamedPayload) => {
            if (uuid === conversation_uuid) {
                mutate(
                    [SWRKey.GET_CONVERSATION_BY_UUID, uuid],
                    (prev: { data: ConversationModel } | undefined) => {
                        if (!prev) {
                            return prev
                        }

                        if (!prev?.data) {
                            return prev
                        }

                        const members = prev.data.members.map((member) => {
                            if (member.user.id === member_id) {
                                return { ...member, nickname }
                            }

                            return member
                        })

                        return {
                            ...prev,
                            data: {
                                ...prev.data,
                                members: [...members],
                            },
                        }
                    },
                    {
                        revalidate: false,
                    },
                )
            }
        }

        socket.on(SocketEvent.CONVERSATION_MEMBER_NICKNAME_CHANGED, socketHandler)

        return () => {
            socket.off(SocketEvent.CONVERSATION_MEMBER_NICKNAME_CHANGED, socketHandler)
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
