import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

import './Typing.css'
import AvatarGroup from '~/components/AvatarGroup'
import SWRKey from '~/enum/SWRKey'
import socket from '~/helpers/socket'
import * as conversationServices from '~/services/conversationService'
import { ConversationMember } from '~/type/type'

const Typing = () => {
    const { uuid } = useParams()

    const [memberTyping, setMemberTyping] = useState<ConversationMember[]>([])

    const { data: conversation } = useSWR(uuid ? [SWRKey.GET_CONVERSATION_BY_UUID, uuid] : null, () => {
        return conversationServices.getConversationByUuid({ uuid: uuid as string })
    })

    useEffect(() => {
        interface Typing {
            conversation_uuid: string
            user_id: number
            is_typing: boolean
        }

        const socketHandler = ({ conversation_uuid, user_id, is_typing }: Typing) => {
            if (conversation_uuid === uuid) {
                if (is_typing) {
                    const member = conversation?.data.members.find((member) => member.user_id === user_id)

                    if (!member) {
                        return
                    }

                    setMemberTyping((prev: ConversationMember[]) => {
                        // only show 2 members typing
                        if (prev.length >= 2) {
                            return prev
                        }

                        return [...prev, member]
                    })
                } else {
                    setMemberTyping((prev: ConversationMember[]) => {
                        return prev.filter((member) => member.user_id !== user_id)
                    })
                }
            }
        }

        socket.on('MESSAGE_TYPING', socketHandler)

        return () => {
            socket.off('MESSAGE_TYPING')
        }
    }, [conversation?.data.members, uuid])

    return memberTyping.length > 0 ? (
        <div className="flex items-center gap-3">
            <AvatarGroup
                avatars={memberTyping.map((member) => member.user.avatar)}
                size={32}
                translate={4}
                className={`h-7 w-${memberTyping.length * 7} [&>img]:h-7 [&>img]:w-7`}
            />
            <div className="inline-block rounded-3xl bg-(--receiver-light-background-color) px-3 py-2 dark:bg-(--receiver-dark-background-color)">
                <div className="typing">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>
            </div>
        </div>
    ) : null
}

export default Typing
