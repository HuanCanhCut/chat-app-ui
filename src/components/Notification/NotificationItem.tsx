import { memo, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { SendIcon } from 'lucide-react'
import { toast } from 'sonner'

import 'moment/locale/vi'
import ConfirmModel from '../ConfirmModal'
import CustomTippy from '../CustomTippy/CustomTippy'
import { AngryIcon, CareIcon, HahaIcon, HeartIcon, LikeIcon, SadIcon, WowIcon } from '../Icons'
import PopperWrapper from '../PopperWrapper/PopperWrapper'
import { faCheck, faEllipsis, faTrash, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from '~/components/Button/Button'
import UserAvatar from '~/components/UserAvatar/UserAvatar'
import config from '~/config'
import { listenEvent, sendEvent } from '~/helpers/events'
import * as NotificationServices from '~/services/notificationService'
import { NotificationModel } from '~/type/type'
import { handleAcceptFriend, handleRejectFriendRequest } from '~/utils/friendEvent'
import { momentTimezone } from '~/utils/moment'

interface NotificationIcon {
    backgroundColor: string
    icon: React.ReactNode
}

const NotificationItem = ({ notification }: { notification: NotificationModel }) => {
    const [isAccept, setIsAccept] = useState(false)
    const [isOpenConfirmModel, setIsOpenConfirmModel] = useState(false)

    const notificationIcon: Record<string, NotificationIcon> = {
        friend_request: {
            backgroundColor: '#1086ee',
            icon: <FontAwesomeIcon icon={faUser} />,
        },
        accept_friend_request: {
            backgroundColor: '#1086ee',
            icon: <FontAwesomeIcon icon={faUser} />,
        },
        message: {
            backgroundColor: '#41cc64',
            icon: <SendIcon />,
        },
    }

    const tippyInstance = useRef<any>(null)

    const tippyShow = (instance: any) => {
        tippyInstance.current = instance
    }

    const handleAccept = async () => {
        const response = await handleAcceptFriend(notification.actor_id, notification.actor.nickname)
        if (response) {
            setIsAccept(true)
        }
    }

    useEffect(() => {
        const remove = listenEvent('TIPPY:TIPPY-HIDDEN', () => {
            // If user accept friend request and tippy is hidden, delete notification
            if (isAccept) {
                sendEvent('NOTIFICATION:DELETE-NOTIFICATION', { notificationId: notification.id! })
            }
        })

        return remove
    }, [isAccept, notification.id])

    const handleReadNotification = async () => {
        sendEvent('NOTIFICATION:UPDATE-READ-STATUS', { notificationId: notification.id!, type: 'read' })

        if (notification.is_read) {
            return
        }

        await NotificationServices.markAsRead(notification.id!)

        tippyInstance.current?.hide()
    }

    const handleDeleteNotification = async () => {
        sendEvent('NOTIFICATION:DELETE-NOTIFICATION', { notificationId: notification.id! })
        setIsOpenConfirmModel(false)
        await NotificationServices.deleteNotification(notification.id!)
        toast.success('Xóa thành công')
    }

    const RenderMoreOptions = () => {
        const buttonStyle =
            'w-full justify-start! bg-transparent py-2! text-black! hover:bg-[rgba(0,0,0,0.1)]! dark:!text-dark dark:hover:bg-[rgba(255,255,255,0.1)]!'

        const handleToggleReadStatus = async (type: 'read' | 'unread') => {
            switch (type) {
                case 'read':
                    await NotificationServices.markAsRead(notification.id!)
                    break
                case 'unread':
                    await NotificationServices.markAsUnread(notification.id!)
                    break
            }

            sendEvent('NOTIFICATION:UPDATE-READ-STATUS', { notificationId: notification.id!, type })

            tippyInstance.current.hide()
        }

        const handleDeleteNotification = async () => {
            setIsOpenConfirmModel(true)
            tippyInstance.current?.hide()
        }

        return (
            <PopperWrapper>
                <>
                    <Button
                        buttonType="primary"
                        leftIcon={<FontAwesomeIcon icon={faCheck} className="text-gray-400 dark:text-gray-600" />}
                        className={buttonStyle}
                        onClick={() => {
                            const isRead = notification.is_read ? 'unread' : 'read'

                            handleToggleReadStatus(isRead)
                        }}
                    >
                        {notification.is_read ? 'Đánh dấu là chưa đọc' : 'Đánh dấu là đã đọc'}
                    </Button>
                    <Button
                        buttonType="primary"
                        leftIcon={<FontAwesomeIcon icon={faTrash} className="text-gray-400 dark:text-gray-600" />}
                        className={buttonStyle}
                        onClick={handleDeleteNotification}
                    >
                        Xóa
                    </Button>
                </>
            </PopperWrapper>
        )
    }

    return (
        <>
            <ConfirmModel
                title="Bạn có chắc muốn xóa thông báo này?"
                isOpen={isOpenConfirmModel}
                closeModal={() => setIsOpenConfirmModel(false)}
                onConfirm={handleDeleteNotification}
                confirmText="Xóa"
            />
            <div className="group relative mt-3 flex items-center gap-2">
                <CustomTippy renderItem={RenderMoreOptions} onShow={tippyShow}>
                    <div className="absolute top-1/2 right-4 mt-2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
                        <Button buttonType="icon">
                            <FontAwesomeIcon icon={faEllipsis} />
                        </Button>
                    </div>
                </CustomTippy>
                <Link
                    href={`${config.routes.user}/@${notification.actor.nickname}`}
                    className={`mt-4 flex gap-3 ${notification.is_read ? 'pr-3' : ''}`}
                    onClick={handleReadNotification}
                >
                    <div className="relative">
                        <UserAvatar src={notification.actor.avatar} size={56} className="aspect-square min-w-[56px]" />
                        {(() => {
                            switch (notification.type) {
                                case 'friend_request':
                                case 'accept_friend_request':
                                case 'message':
                                    return (
                                        <div className="flex-center absolute right-0 bottom-[-3px] gap-2">
                                            <div
                                                className="flex-center h-7 w-7 rounded-full text-white"
                                                style={{
                                                    backgroundColor:
                                                        notificationIcon[notification.type].backgroundColor,
                                                }}
                                            >
                                                {notificationIcon[notification.type].icon}
                                            </div>
                                        </div>
                                    )
                                case 'reaction':
                                    const iconMapping = {
                                        '1f44d': <LikeIcon width={28} height={28} />,
                                        '1f970': <CareIcon width={28} height={28} />,
                                        '2764-fe0f': <HeartIcon width={28} height={28} />,
                                        '1f602': <HahaIcon width={28} height={28} />,
                                        '1f62e': <WowIcon width={28} height={28} />,
                                        '1f622': <SadIcon width={28} height={28} />,
                                        '1f621': <AngryIcon width={28} height={28} />,
                                    }

                                    const unified = JSON.parse(notification.metadata || '""').reaction

                                    return (
                                        <div className="absolute right-0 bottom-0">
                                            {iconMapping[unified?.toLowerCase() as keyof typeof iconMapping]}
                                        </div>
                                    )
                                default:
                                    return null
                            }
                        })()}
                    </div>

                    <div>
                        <p
                            className={`pr-4 text-sm font-normal ${notification.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}
                        >
                            {(() => {
                                const parts = notification.message.split(`${notification.actor.full_name.trim()}`)

                                return parts.map((part, index) => (
                                    <span key={index}>
                                        {part}
                                        {index < parts.length - 1 && (
                                            <span className="font-semibold">{notification.actor.full_name.trim()}</span>
                                        )}
                                    </span>
                                ))
                            })()}
                        </p>
                        <small
                            className={`text-xs ${!notification.is_read ? 'text-primary' : 'text-gray-600 dark:text-gray-400'} font-medium`}
                        >
                            {momentTimezone(notification.created_at!)}
                        </small>
                    </div>
                </Link>
                {!notification.is_read && (
                    <button className="bg-primary mt-4 ml-auto h-3 min-w-3 rounded-full"></button>
                )}
            </div>

            {notification.type === 'friend_request' && !isAccept && (
                <div className="mt-5 flex items-center justify-center gap-2 px-12">
                    <Button buttonType="primary" className="inline-block flex-1" onClick={handleAccept}>
                        Chấp nhận
                    </Button>
                    <Button
                        buttonType="rounded"
                        className="inline-block flex-1"
                        onClick={() => handleRejectFriendRequest(notification.actor_id)}
                    >
                        Xóa
                    </Button>
                </div>
            )}
            {isAccept && (
                <p className="mt-4 text-sm font-normal text-gray-800 dark:text-gray-200">
                    Đã chấp nhận lời mời kết bạn
                </p>
            )}
        </>
    )
}

export default memo(NotificationItem)
