import Link from 'next/link'
import { useState } from 'react'

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
            sendEvent({ eventName: 'notification:delete-notification' })
        }
    }

    return (
        <>
            <Link
                href={`/user/@${notification.notification_details.sender_user.nickname}`}
                className="mt-4 flex gap-3"
                onClick={() => {
                    sendEvent({ eventName: 'tippy:hide' })
                }}
            >
                <div className="relative">
                    <UserAvatar src={notification.notification_details.sender_user.avatar} size={56} />
                    <div className="flex-center absolute bottom-[-6px] right-[-6px] gap-2">
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
                        className="text-sm font-normal text-gray-800 dark:font-light dark:text-gray-200"
                    ></p>
                </div>
            </Link>

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
