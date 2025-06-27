'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

import { SocketEvent } from '~/enum/SocketEvent'
import SWRKey from '~/enum/SWRKey'
import { listenEvent } from '~/helpers/events'
import socket from '~/helpers/socket'
import Header from '~/layouts/Chat/Header'
import Info from '~/layouts/Chat/Info/Info'
import InputMessage from '~/layouts/Chat/InputMessage'
import Message from '~/layouts/Chat/Message'
import * as conversationServices from '~/services/conversationService'
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

    useEffect(() => {
        const remove = listenEvent({
            eventName: 'info:toggle',
            handler: ({ detail: { isOpen } }: { detail: { isOpen: boolean } }) => {
                setInfoOpen(isOpen)
            },
        })

        return remove
    }, [])

    return (
        <div className="flex h-full max-w-full">
            {/* Don't change the invisible below to hidden to avoid uncontrolled scrolling in the message component */}
            <div
                className={`flex max-w-full flex-grow flex-col ${infoOpen ? 'invisible w-0 sm:visible sm:flex sm:w-auto' : 'flex'}`}
            >
                <Header isInfoOpen={infoOpen} conversation={conversation?.data} />
                <Message />
                <InputMessage />
            </div>
            {infoOpen && (
                <Info
                    className={`${infoOpen ? 'block' : 'hidden'} w-full sm:w-auto sm:min-w-[300px] md:block lg:min-w-[320px]`}
                />
            )}
        </div>
    )
}

export default MessagePage
