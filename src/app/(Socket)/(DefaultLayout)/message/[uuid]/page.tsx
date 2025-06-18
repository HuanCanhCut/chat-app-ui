'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { useParams } from 'next/navigation'

import * as conversationServices from '~/services/conversationService'
import Header from '../../../../../layouts/Chat/Header'
import Message from '../../../../../layouts/Chat/Message'
import InputMessage from '../../../../../layouts/Chat/InputMessage'
import Info from '../../../../../layouts/Chat/Info/Info'
import SWRKey from '~/enum/SWRKey'
import socket from '~/helpers/socket'
import { SocketEvent } from '~/enum/SocketEvent'
import { UserStatus } from '~/type/type'

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
        const socketHandler = (data: UserStatus) => {
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
        }

        socket.on(SocketEvent.USER_STATUS, socketHandler)

        return () => {
            socket.off(SocketEvent.USER_STATUS, socketHandler)
        }
    }, [conversation, conversation?.data, mutateConversation])

    const toggleInfo = () => {
        setInfoOpen(!infoOpen)
    }

    return (
        <div className="flex h-full max-w-full">
            <div className={`flex max-w-full flex-grow flex-col ${infoOpen ? 'hidden sm:flex' : 'flex'}`}>
                <Header toggleInfo={toggleInfo} conversation={conversation?.data} />
                <Message />
                <InputMessage />
            </div>
            {infoOpen && (
                <Info className={`${infoOpen ? 'block' : 'hidden'} min-w-[300px] md:block lg:min-w-[320px]`} />
            )}
        </div>
    )
}

export default MessagePage
