import Link from 'next/link'
import { useParams } from 'next/navigation'
import moment from 'moment-timezone'

import UserAvatar from '~/components/UserAvatar'
import { ConversationModel } from '~/type/type'
import { momentTimezone } from '~/utils/moment'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import { useEffect, useState } from 'react'
import socket from '~/helpers/socket'
import { SocketEvent } from '~/enum/SocketEvent'

interface Props {
    conversation: ConversationModel
    className?: string
}

const ConversationItem: React.FC<Props> = ({ conversation, className = '' }) => {
    const currentUser = useAppSelector(getCurrentUser)
    const { uuid } = useParams()

    const isActive = uuid === conversation.uuid

    // if not group then get user !== current user in conversation_members
    const userMember = conversation.conversation_members.find((member) => member.user_id !== currentUser?.data.id)?.user

    const isRead =
        conversation.last_message.sender_id !== currentUser?.data.id ? conversation.last_message.is_read : true

    const dateDiff = (date: Date) => {
        return moment.tz(new Date(Date.now()).toISOString(), 'Asia/Ho_Chi_Minh').diff(date, 'minutes')
    }

    const [lastOnlineTime, setLastOnlineTime] = useState<number | null>(
        userMember?.last_online_at ? dateDiff(userMember?.last_online_at) : null,
    )

    useEffect(() => {
        socket.on(SocketEvent.USER_OFFLINE_TIMER, (data) => {
            conversation.conversation_members.forEach((member) => {
                if (member.user_id === data.user_id) {
                    setLastOnlineTime(dateDiff(data.last_online_at))
                    return
                }
            })
        })
    }, [conversation.conversation_members, userMember?.last_online_at])

    return (
        <>
            <Link
                href={`/message/${conversation.uuid}`}
                className={`flex items-center rounded-lg p-2 pr-5 ${!isActive ? 'hover:bg-lightGray hover:dark:bg-darkGray' : ''} ${className} ${isActive ? 'bg-[#ebf5ff] dark:bg-[#222e39bd]' : ''}`}
            >
                <div className="relative flex-shrink-0">
                    <UserAvatar
                        src={conversation?.avatar || userMember?.avatar}
                        size={56}
                        className="h-[48px] w-[48px] lg:h-[56px] lg:w-[56px]"
                    />
                    {!conversation.is_group &&
                        (userMember?.is_online ? (
                            <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500 dark:border-dark"></div>
                        ) : (
                            lastOnlineTime &&
                            lastOnlineTime < 60 && (
                                <div className="flex-center absolute bottom-0 right-[-4px] h-4 w-6 rounded-xl border-2 border-black bg-green-800 text-green-400">
                                    <span className="text-[8px] font-medium">
                                        {/* if date diff < 1 hour then show minutes else show hours */}
                                        {`${lastOnlineTime}p`}
                                    </span>
                                </div>
                            )
                        ))}
                </div>
                <div className="ml-3 overflow-hidden">
                    <p className="truncate font-medium">{conversation.name || userMember?.full_name}</p>
                    <div
                        className={`flex items-center text-xs font-normal ${isRead ? 'text-gray-600 dark:text-gray-400' : 'font-medium text-black dark:text-gray-200'} `}
                    >
                        <span className="truncate pr-1">
                            {currentUser?.data.id === conversation.last_message?.sender_id
                                ? `Bạn: ${conversation.last_message?.content}`
                                : `${!conversation.is_group ? '' : conversation.last_message?.sender.full_name + ': '} ${conversation.last_message?.content}`}
                        </span>
                        <span className="flex-shrink-0">· {momentTimezone(conversation.last_message?.created_at)}</span>
                    </div>
                </div>
            </Link>
        </>
    )
}

export default ConversationItem
