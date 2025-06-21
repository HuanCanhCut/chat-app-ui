'use client'

import { useRouter } from 'next/navigation'
import UserAvatar from '~/components/UserAvatar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { ConversationModel, UserStatus } from '~/type/type'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import { useEffect, useRef, useState } from 'react'
import moment from 'moment-timezone'
import config from '~/config'
import socket from '~/helpers/socket'
import { SocketEvent } from '~/enum/SocketEvent'
import { sendEvent } from '~/helpers/events'
interface HeaderProps {
    className?: string
    isInfoOpen: boolean
    conversation: ConversationModel | undefined
}

const Header: React.FC<HeaderProps> = ({ className = '', isInfoOpen, conversation }) => {
    const currentUser = useAppSelector(getCurrentUser)
    const router = useRouter()

    const offlineTimerSocket = useRef<NodeJS.Timeout | null>(null)
    const offlineTimer = useRef<NodeJS.Timeout | null>(null)

    const handleNavigate = () => {
        if (!conversation?.is_group) {
            const member = conversation?.conversation_members.find((member) => member.user_id !== currentUser?.data.id)

            router.push(`${config.routes.user}/@${member?.user.nickname}`)
        }
    }

    const conversationMember = conversation?.conversation_members.find(
        (member) => member.user_id !== currentUser?.data.id,
    )

    const dateDiff = (date: Date) => {
        return moment.tz(new Date(Date.now()).toISOString(), 'Asia/Ho_Chi_Minh').diff(date, 'minutes')
    }

    const [lastOnlineTime, setLastOnlineTime] = useState<number | null>(null)

    const handleFormatTime = (time: number) => {
        if (time < 60) {
            return `${time} phút trước`
        }

        return `${Math.floor(time / 60)} giờ trước`
    }

    useEffect(() => {
        if (conversationMember && conversationMember.user.last_online_at) {
            setLastOnlineTime(dateDiff(conversationMember.user.last_online_at))
        }
    }, [conversationMember])

    useEffect(() => {
        const socketHandler = (data: UserStatus) => {
            if (offlineTimer.current) {
                clearTimeout(offlineTimer.current)
            }

            if (data.user_id === conversationMember?.user.id && !data.is_online) {
                offlineTimerSocket.current = setInterval(() => {
                    setLastOnlineTime(dateDiff(new Date(data.last_online_at)))
                }, 1000 * 30) // 30 seconds
            }
        }

        socket.on(SocketEvent.USER_STATUS, socketHandler)

        return () => {
            socket.off(SocketEvent.USER_STATUS, socketHandler)

            if (offlineTimerSocket.current) {
                clearTimeout(offlineTimerSocket.current)
            }
        }
    }, [conversationMember?.user.id])

    useEffect(() => {
        if (!conversationMember?.user.is_online) {
            if (conversationMember?.user.last_online_at) {
                offlineTimer.current = setInterval(() => {
                    setLastOnlineTime(dateDiff(new Date(conversationMember?.user.last_online_at)))
                }, 1000 * 30) // 30 seconds
            }
        }

        return () => {
            if (offlineTimer.current) {
                clearTimeout(offlineTimer.current)
            }
        }
    }, [conversationMember?.user.is_online, conversationMember?.user.last_online_at])

    const handleToggleInfo = () => {
        sendEvent({
            eventName: 'info:toggle',
            detail: {
                isOpen: !isInfoOpen,
            },
        })
    }

    return (
        <div
            className={`${className} flex items-center justify-between px-2 py-1 shadow-sm shadow-gray-200 dark:[box-shadow:1px_2px_4px_rgba(0,0,0,0.1)]`}
        >
            <div className="flex items-center">
                <div
                    className="flex-center cursor-pointer rounded-lg px-1 py-1 hover:bg-lightGray dark:hover:bg-darkGray bp900:hidden"
                    onClick={() => router.push('/message')}
                >
                    <FontAwesomeIcon
                        icon={faChevronLeft}
                        className="text-xl dark:text-gray-500"
                        width={22}
                        height={22}
                    />
                </div>
                <div
                    className="flex h-full cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-lightGray dark:hover:bg-darkGray"
                    onClick={handleNavigate}
                >
                    <div className="relative flex-shrink-0">
                        <UserAvatar
                            src={conversation?.is_group ? conversation?.avatar : conversationMember?.user?.avatar}
                            size={40}
                        />
                        {!conversation?.is_group && conversationMember?.user?.is_online && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-dark"></div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <h4 className="max-w-[150px] truncate whitespace-nowrap font-semibold xs:max-w-[200px] sm:max-w-[250px] md:max-w-[350px]">
                            {conversation?.is_group
                                ? conversation?.name
                                : conversationMember?.nickname || conversationMember?.user?.full_name}
                        </h4>
                        {!conversation?.is_group && (
                            <span className="text-xs font-normal text-zinc-700 dark:text-gray-400">
                                {conversationMember?.user?.is_online
                                    ? 'Đang hoạt động'
                                    : lastOnlineTime && `Hoạt động ${handleFormatTime(lastOnlineTime)}`}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center">
                <FontAwesomeIcon
                    icon={faCircleInfo}
                    width={20}
                    height={20}
                    className="cursor-pointer text-xl dark:text-gray-500"
                    onClick={handleToggleInfo}
                />
            </div>
        </div>
    )
}

export default Header
