'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

import { SocketEvent } from '~/enum/SocketEvent'
import SWRKey from '~/enum/SWRKey'
import { listenEvent } from '~/helpers/events'
import socket from '~/helpers/socket'
import Header from '~/layouts/Chat/Header'
import Info from '~/layouts/Chat/Info/Info'
import InputMessage from '~/layouts/Chat/InputMessage'
import Block from '~/layouts/Chat/InputMessage/Block'
import Message from '~/layouts/Chat/Message'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import * as conversationServices from '~/services/conversationService'
import { SocketMessage, UserStatus } from '~/type/type'

const MessagePage = () => {
    const { uuid } = useParams()

    const currentUser = useAppSelector(getCurrentUser)

    const [infoOpen, setInfoOpen] = useState(false)

    const { data: conversation, mutate: mutateConversation } = useSWR(
        uuid ? [SWRKey.GET_CONVERSATION_BY_UUID, uuid] : null,
        () => {
            return conversationServices.getConversationByUuid({ uuid: uuid as string })
        },
    )

    const currentMember = useMemo(() => {
        return conversation?.data?.members.find((member) => member.user_id === currentUser?.data.id)
    }, [conversation?.data?.members, currentUser?.data.id])

    const isBlocked = currentMember?.deleted_at || !currentMember || conversation?.data.block_conversation

    useEffect(() => {
        const socketHandler = (data: UserStatus) => {
            if (!conversation?.data) {
                return
            }

            if (conversation.data.is_group) {
                return
            }

            mutateConversation(
                {
                    ...conversation,
                    data: {
                        ...conversation.data,
                        members: conversation.data.members.map((member) => ({
                            ...member,
                            user: { ...member.user, is_online: data.is_online },
                        })),
                    },
                },
                {
                    revalidate: false,
                },
            )
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

    useEffect(() => {
        if (conversation?.data) {
            if (conversation.data.theme?.theme_config) {
                const themeConfig = conversation.data.theme.theme_config
                const parsedThemeConfig = typeof themeConfig === 'string' ? JSON.parse(themeConfig) : themeConfig

                const cssVariables: { key: string; value: string }[] = []

                const processThemeObject = (obj: any, prefix: string = '') => {
                    for (const key in obj) {
                        const newPrefix = prefix ? `${prefix}_${key}` : key

                        if (typeof obj[key] === 'object' && obj[key] !== null) {
                            processThemeObject(obj[key], newPrefix)
                        } else {
                            cssVariables.push({
                                key: newPrefix,
                                value: obj[key].startsWith('https') ? `url('${obj[key]}')` : obj[key],
                            })
                        }
                    }
                }

                processThemeObject(parsedThemeConfig)

                cssVariables.forEach((variable) => {
                    if (variable.value) {
                        document.documentElement.style.setProperty(
                            `--${variable.key.replaceAll('_', '-')}`,
                            variable.value,
                        )
                    }
                })
            }
        }
    }, [conversation?.data])

    useEffect(() => {
        const socketHandler = (data: SocketMessage) => {
            if (data.conversation.uuid === uuid && conversation?.data.is_temp) {
                mutateConversation()
            }
        }

        socket.on(SocketEvent.NEW_MESSAGE, socketHandler)

        return () => {
            socket.off(SocketEvent.NEW_MESSAGE, socketHandler)
        }
    }, [conversation?.data?.is_temp, mutateConversation, uuid])

    return (
        <div className="flex h-full max-w-full">
            {/* Don't change the 'invisible' below to hidden to avoid uncontrolled scrolling in the message component */}
            <div
                className={`flex max-w-full flex-grow flex-col border-r dark:border-zinc-700 ${infoOpen && 'border-r'} border-gray-200 dark:border-zinc-700 ${infoOpen ? 'invisible w-0 sm:visible sm:flex sm:w-auto' : 'flex'}`}
            >
                {conversation?.data && (
                    <>
                        <Header isInfoOpen={infoOpen} conversation={conversation.data} />
                        <Message conversation={conversation.data} />

                        {isBlocked ? <Block currentMember={currentMember} /> : <InputMessage />}
                    </>
                )}
            </div>
            {!conversation?.data?.is_temp && (
                <Info
                    className={`${infoOpen ? 'block w-full sm:max-w-[280px] md:max-w-[300px] lg:max-w-[320px] xl:max-w-[380px]' : 'hidden !w-0 !p-0'} `}
                    isOpen={infoOpen}
                />
            )}
        </div>
    )
}

export default MessagePage
