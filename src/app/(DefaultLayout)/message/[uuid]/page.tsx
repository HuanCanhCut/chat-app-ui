'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { useParams } from 'next/navigation'

import * as conversationServices from '~/services/conversationService'
import Header from './layout/Chat/Header'
import Message from './layout/Chat/Message'
import EnterMessage from './layout/Chat/EnterMessage'
import Info from './layout/Info/Info'
import SWRKey from '~/enum/SWRKey'
import socket from '~/helpers/socket'
import { SocketEvent } from '~/enum/SocketEvent'

const MessagePage = () => {
    const { uuid } = useParams()

    const [infoOpen, setInfoOpen] = useState(false)

    const { data: conversation, mutate: mutateConversation } = useSWR(
        uuid ? [SWRKey.GET_CONVERSATION_BY_UUID, uuid] : null,
        () => {
            return conversationServices.getConversationByUuid({ uuid: uuid as string })
        },
    )

    useEffect(() => {
        socket.on(SocketEvent.USER_STATUS, (data) => {
            if (!conversation?.data) {
                return
            }

            if (conversation.data.is_group) {
                return
            }

            conversation.data.conversation_members.find((member) => {
                if (member.id === data.user_id) {
                    mutateConversation({
                        ...conversation,
                        data: {
                            ...conversation.data,
                            conversation_members: conversation.data.conversation_members.map((member) => ({
                                ...member,
                                user: {
                                    ...member.user,
                                    is_online: data.is_online,
                                },
                            })),
                        },
                    })
                }
            })
        })
    }, [conversation, conversation?.data, mutateConversation])

    const toggleInfo = () => {
        setInfoOpen(!infoOpen)
    }

    return (
        <div className="flex h-full">
            <div className="flex flex-grow flex-col">
                <Header toggleInfo={toggleInfo} conversation={conversation?.data} />
                <Message />
                <EnterMessage />
            </div>
            {infoOpen && (
                <Info className={`${infoOpen ? 'block' : 'hidden'} min-w-[280px] md:block lg:min-w-[320px]`} />
            )}
        </div>
    )
}

export default MessagePage
