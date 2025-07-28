import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { mutate } from 'swr'

import ControlPanel from './components/ControlPanel'
import MediaAndLink from './components/MediaAndLink'
import SearchMessage from './components/SearchMessage'
import { SocketEvent } from '~/enum/SocketEvent'
import SWRKey from '~/enum/SWRKey'
import socket from '~/helpers/socket'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import { ConversationMember, ConversationModel, ConversationThemeModel } from '~/type/type'

interface InfoProps {
    className?: string
    isOpen: boolean
}

const sharedSocketEvents = [
    SocketEvent.CONVERSATION_RENAMED,
    SocketEvent.CONVERSATION_AVATAR_CHANGED,
    SocketEvent.CONVERSATION_THEME_CHANGED,
    SocketEvent.CONVERSATION_EMOJI_CHANGED,
    SocketEvent.CONVERSATION_BLOCKED,
    SocketEvent.CONVERSATION_UNBLOCKED,
]

const sharedSocketEventMemberHandlers = [
    SocketEvent.CONVERSATION_MEMBER_NICKNAME_CHANGED,
    SocketEvent.CONVERSATION_LEADER_CHANGED,
]

interface InfoHierarchyItem {
    type: string
    component: React.ReactNode
    children?: InfoHierarchyItem[]
}

const Info: React.FC<InfoProps> = ({ className = '', isOpen }) => {
    const { uuid } = useParams()
    const currentUser = useAppSelector(getCurrentUser)

    const handleChose = useCallback(
        (type: string) => {
            let hierarchyItem: InfoHierarchyItem | undefined

            const handleFindItem = (items: InfoHierarchyItem[]) => {
                for (const item of items) {
                    if (item.type === type) {
                        hierarchyItem = item
                        break
                    }

                    if (item.children) {
                        handleFindItem(item.children)
                    }
                }
            }

            handleFindItem(INFO_HIERARCHY)

            if (hierarchyItem) {
                setHistory((prev: { data: InfoHierarchyItem[] }[]) => {
                    const newHistory = [...prev, { data: [hierarchyItem!] }]
                    return newHistory
                })
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )

    const handleBack = useCallback(() => {
        setHistory((prev: { data: InfoHierarchyItem[] }[]) => {
            return prev.slice(0, prev.length - 1)
        })
    }, [])

    const INFO_HIERARCHY: InfoHierarchyItem[] = useMemo(() => {
        return [
            {
                type: 'control_panel',
                component: <ControlPanel onChose={handleChose} />,
                children: [
                    {
                        type: 'search_message',
                        component: <SearchMessage onBack={handleBack} />,
                    },
                    {
                        type: 'media',
                        component: <MediaAndLink onBack={handleBack} defaultActiveTab="media" />,
                    },
                    {
                        type: 'link',
                        component: <MediaAndLink onBack={handleBack} defaultActiveTab="link" />,
                    },
                ],
            },
        ]
    }, [handleBack, handleChose])

    const [history, setHistory] = useState([{ data: INFO_HIERARCHY }])

    const current = history[history.length - 1]

    useEffect(() => {
        if (!isOpen) {
            setHistory([{ data: INFO_HIERARCHY }])
        }
    }, [INFO_HIERARCHY, isOpen])

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
            user_id: number
            key: string
            value: string
        }

        const socketHandler = ({ conversation_uuid, user_id, key, value }: ConversationRenamedPayload) => {
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
                            if (member.user.id === Number(user_id)) {
                                return { ...member, [key]: value }
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

        sharedSocketEventMemberHandlers.forEach((event) => {
            socket.on(event, socketHandler)
        })

        return () => {
            sharedSocketEventMemberHandlers.forEach((event) => {
                socket.off(event, socketHandler)
            })
        }
    }, [uuid])

    useEffect(() => {
        const socketHandler = ({ conversation_uuid, member_id }: { conversation_uuid: string; member_id: number }) => {
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

                        let newMembers = prev.data.members

                        // if member_id is current user, set deleted_at to current time
                        if (member_id === currentUser.data.id) {
                            newMembers = newMembers.map((member) => {
                                if (member.id === member_id) {
                                    return { ...member, deleted_at: new Date() }
                                }

                                return member
                            })
                        } else {
                            newMembers = newMembers.filter((member) => member.id !== member_id)
                        }

                        // leave conversation
                        socket.emit(SocketEvent.LEAVE_ROOM, {
                            conversation_uuid: uuid,
                            user_id: prev.data.members.find((member) => member.id === member_id)?.user.id,
                        })

                        return {
                            ...prev,
                            data: {
                                ...prev.data,
                                members: [...newMembers],
                            },
                        }
                    },
                    {
                        revalidate: false,
                    },
                )
            }
        }

        socket.on(SocketEvent.CONVERSATION_MEMBER_REMOVED, socketHandler)

        return () => {
            socket.off(SocketEvent.CONVERSATION_MEMBER_REMOVED, socketHandler)
        }
    }, [currentUser?.data.id, uuid])

    useEffect(() => {
        const socketHandler = ({
            conversation_uuid,
            members,
        }: {
            conversation_uuid: string
            members: ConversationMember[]
        }) => {
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
                                members: [...prev.data.members, ...members],
                            },
                        }
                    },
                    {
                        revalidate: false,
                    },
                )
            }
        }

        socket.on(SocketEvent.CONVERSATION_MEMBER_ADDED, socketHandler)

        return () => {
            socket.off(SocketEvent.CONVERSATION_MEMBER_ADDED, socketHandler)
        }
    }, [currentUser?.data.id, uuid])

    return (
        <div
            id="info-container"
            className={`${className} min-h-[calc(100dvh-var(--header-height-mobile))] px-2 py-3 [overflow:overlay] sm:min-h-[calc(100dvh-var(--header-height))]`}
        >
            {current.data.map((item, index) => {
                return <React.Fragment key={index}>{item.component}</React.Fragment>
            })}
        </div>
    )
}

export default Info
