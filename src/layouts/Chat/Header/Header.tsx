'use client'

import { memo, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { faChevronLeft, faCircleInfo, faPhone, faVideo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from '~/components/Button'
import UserAvatar from '~/components/UserAvatar'
import config from '~/config'
import { sendEvent } from '~/helpers/events'
import socket from '~/helpers/socket'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import { ConversationModel } from '~/type/type'
import { momentTimezone } from '~/utils/moment'
import openWindowCall from '~/utils/openWindowCall'
interface HeaderProps {
    className?: string
    isInfoOpen: boolean
    conversation: ConversationModel
}

const Header: React.FC<HeaderProps> = ({ className = '', isInfoOpen, conversation }) => {
    const currentUser = useAppSelector(getCurrentUser)
    const router = useRouter()

    const offlineTimerSocket = useRef<NodeJS.Timeout | null>(null)
    const offlineTimer = useRef<NodeJS.Timeout | null>(null)

    const handleNavigate = () => {
        if (!conversation.is_group) {
            const member = conversation.members.find((member) => member.user_id !== currentUser?.data.id)

            router.push(`${config.routes.user}/@${member?.user.nickname}`)
        }
    }

    const conversationMember = conversation.members.find((member) => member.user_id !== currentUser?.data.id)

    const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null)

    useEffect(() => {
        if (conversationMember && conversationMember.user.last_online_at) {
            setLastOnlineTime(conversationMember.user.last_online_at)
        }
    }, [conversationMember])

    useEffect(() => {
        const socketHandler = ({
            user_id,
            is_online,
            last_online_at,
        }: {
            user_id: number
            is_online: boolean
            last_online_at: string | null
        }) => {
            if (offlineTimer.current) {
                clearTimeout(offlineTimer.current)
            }

            if (user_id === conversationMember?.user.id && !is_online) {
                sendEvent('USER:STATUS', {
                    user_id: conversationMember?.user.id,
                    is_online: false,
                    last_online_at: new Date(conversationMember?.user.last_online_at || new Date()),
                })

                offlineTimerSocket.current = setInterval(() => {
                    setLastOnlineTime(new Date(last_online_at || new Date()))
                }, 1000 * 30) // 30 seconds
            }
        }

        socket.on('USER_STATUS', socketHandler)

        return () => {
            socket.off('USER_STATUS', socketHandler)

            if (offlineTimerSocket.current) {
                clearTimeout(offlineTimerSocket.current)
            }
        }
    }, [conversationMember?.user.id, conversationMember?.user.last_online_at])

    useEffect(() => {
        if (!conversationMember?.user.is_online) {
            if (conversationMember?.user.last_online_at) {
                sendEvent('USER:STATUS', {
                    user_id: conversationMember?.user.id,
                    is_online: false,
                    last_online_at: new Date(conversationMember?.user.last_online_at),
                })

                offlineTimer.current = setInterval(() => {
                    setLastOnlineTime(new Date(conversationMember?.user.last_online_at || new Date()))
                }, 1000 * 30) // 30 seconds
            }
        }

        return () => {
            if (offlineTimer.current) {
                clearTimeout(offlineTimer.current)
            }
        }
    }, [conversationMember?.user.id, conversationMember?.user.is_online, conversationMember?.user.last_online_at])

    const handleToggleInfo = () => {
        sendEvent('INFO:TOGGLE', { isOpen: !isInfoOpen })
    }

    const handleVoiceCall = () => {
        openWindowCall({
            memberNickname: conversationMember?.user.nickname,
            type: 'voice',
            conversationUuid: conversation.uuid,
            subType: 'caller',
        })
    }

    const handleVideoCall = () => {
        openWindowCall({
            memberNickname: conversationMember?.user.nickname,
            type: 'video',
            conversationUuid: conversation.uuid,
            subType: 'caller',
        })
    }

    return (
        <div
            className={`${className} z-10 flex items-center justify-between bg-(--background-theme-light-header-color) px-2 py-1 shadow-xs [box-shadow:1px_0px_8px_rgba(0,0,0,0.1)] dark:bg-(--background-theme-dark-header-color) dark:[box-shadow:1px_0px_8px_rgba(0,0,0,0.2)]`}
        >
            <div className="flex items-center">
                <div
                    className="flex-center bp900:hidden cursor-pointer rounded-lg px-1 py-1 hover:bg-[#99999926]! dark:hover:bg-[#383b3b25]!"
                    onClick={() => router.push('/message')}
                >
                    <FontAwesomeIcon
                        icon={faChevronLeft}
                        className="text-xl text-(--sender-light-background-color) dark:text-(--sender-dark-background-color)"
                        width={22}
                        height={22}
                    />
                </div>
                <div
                    className="flex h-full cursor-pointer items-center gap-3 rounded-lg p-2 pr-4 hover:bg-[#99999926] dark:bg-transparent dark:hover:bg-[#383b3b25]"
                    onClick={handleNavigate}
                >
                    <div className="relative shrink-0">
                        <UserAvatar
                            src={conversation.is_group ? conversation.avatar : conversationMember?.user?.avatar}
                            size={40}
                            isOnline={conversation.members.some(
                                (member) => member.user.is_online && member.user.id !== currentUser?.data.id,
                            )}
                        />
                    </div>
                    <div className="flex flex-col">
                        <h4 className="xs:max-w-[200px] max-w-[150px] truncate font-semibold whitespace-nowrap sm:max-w-[250px] md:max-w-[350px]">
                            {conversation.is_group
                                ? conversation.name
                                : conversationMember?.nickname || conversationMember?.user?.full_name}
                        </h4>
                        <span className="text-xs font-normal text-zinc-700 dark:text-gray-400">
                            {!conversation.is_group
                                ? conversationMember?.user?.is_online
                                    ? 'Đang hoạt động'
                                    : lastOnlineTime && `Hoạt động ${momentTimezone(lastOnlineTime)} trước`
                                : `${conversation.members.filter((member) => member.user.is_online && member.user.id !== currentUser?.data.id).length} người đang hoạt động`}
                        </span>
                    </div>
                </div>
            </div>
            {!conversation.is_temp && (
                <div className="flex items-center">
                    {!conversation.is_group && !conversation.is_temp && (
                        <>
                            <Button
                                buttonType="icon"
                                className="bg-transparent hover:bg-[#99999926]! dark:bg-transparent dark:hover:bg-[#383b3b25]!"
                                onClick={handleVoiceCall}
                            >
                                <FontAwesomeIcon
                                    icon={faPhone}
                                    width={20}
                                    height={20}
                                    className="cursor-pointer text-xl text-(--sender-light-background-color) dark:text-(--sender-dark-background-color)"
                                />
                            </Button>

                            <Button
                                buttonType="icon"
                                className="bg-transparent hover:bg-[#99999926]! dark:bg-transparent dark:hover:bg-[#383b3b25]!"
                                onClick={handleVideoCall}
                            >
                                <FontAwesomeIcon
                                    icon={faVideo}
                                    width={20}
                                    height={20}
                                    className="cursor-pointer text-xl text-(--sender-light-background-color) dark:text-(--sender-dark-background-color)"
                                />
                            </Button>
                        </>
                    )}

                    <Button
                        buttonType="icon"
                        className="bg-transparent hover:bg-[#99999926]! dark:bg-transparent dark:hover:bg-[#383b3b25]!"
                        onClick={handleToggleInfo}
                    >
                        <FontAwesomeIcon
                            icon={faCircleInfo}
                            width={20}
                            height={20}
                            className="cursor-pointer text-xl text-(--sender-light-background-color) dark:text-(--sender-dark-background-color)"
                        />
                    </Button>
                </div>
            )}
        </div>
    )
}

export default memo(Header)
