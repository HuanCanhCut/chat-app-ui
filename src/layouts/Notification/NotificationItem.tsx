import moment from 'moment-timezone'
import Link from 'next/link'
import { useState } from 'react'

import * as NotificationServices from '~/services/notification'
import Button from '~/components/Button'
import UserAvatar from '~/components/UserAvatar'
import { sendEvent } from '~/helpers/events'
import { handleAcceptFriend } from '~/project/services'
import { NotificationData } from '~/type/type'

const NotificationItem = ({
    notification,
    notificationIcon,
}: {
    notification: NotificationData
    notificationIcon: any
}) => {
    const [isAccept, setIsAccept] = useState(false)

    const handleAccept = async () => {
        const response = await handleAcceptFriend(notification.notification_details.sender_user.id)
        if (response) {
            setIsAccept(true)
            sendEvent({ eventName: 'notification:delete-notification', detail: notification.id })
        }
    }

    const handleReadNotification = async () => {
        await NotificationServices.read(notification.id)
        sendEvent({ eventName: 'tippy:hide' })
    }

    return (
        <>
            <div className="flex-center gap-2">
                <Link
                    href={`/user/@${notification.notification_details.sender_user.nickname}`}
                    className="mt-4 flex gap-3"
                    onClick={handleReadNotification}
                >
                    <div className="relative">
                        <UserAvatar src={notification.notification_details.sender_user.avatar} size={56} />
                        <div className="flex-center absolute bottom-1 right-[-6px] gap-2">
                            <div
                                className="flex-center h-7 w-7 rounded-full text-white"
                                style={{
                                    backgroundColor: notificationIcon[notification.type].backgroundColor,
                                }}
                            >
                                {notificationIcon[notification.type].icon}
                            </div>
                        </div>
                    </div>

                    <div>
                        <p
                            dangerouslySetInnerHTML={{
                                __html: `
                                ${notification.notification_details.message.replace(
                                    `${notification.notification_details.sender_user.full_name.trim()}`,
                                    `<span class="font-semibold">${notification.notification_details.sender_user.full_name.trim()}</span>`,
                                )}`,
                            }}
                            className={`text-sm font-normal dark:font-light ${notification.notification_details.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}
                        ></p>
                        <small
                            className={`text-xs ${
                                !notification.notification_details.is_read
                                    ? 'text-primary'
                                    : 'text-gray-600 dark:text-gray-400'
                            } font-normal`}
                        >
                            {moment
                                .tz(notification.notification_details.createdAt, 'Asia/Ho_Chi_Minh')
                                .fromNow()
                                .replace('trước', '')}
                        </small>
                    </div>
                </Link>
                {!notification.notification_details.is_read && (
                    <button className="h-3 min-w-3 rounded-full bg-primary"></button>
                )}
            </div>

            {notification.type === 'friend_request' && !isAccept && (
                <div className="mt-5 flex items-center justify-center gap-2 px-12">
                    <Button buttonType="primary" className="inline-block flex-1" onClick={handleAccept}>
                        Chấp nhận
                    </Button>
                    <Button buttonType="rounded" className="inline-block flex-1">
                        Xóa
                    </Button>
                </div>
            )}
            {isAccept && (
                <p className="mt-4 text-sm font-normal text-gray-800 dark:font-light dark:text-gray-200">
                    Đã chấp nhận lời mời kết bạn
                </p>
            )}
        </>
    )
}

export default NotificationItem
