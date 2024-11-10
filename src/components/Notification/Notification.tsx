import { faBell, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import useSWR from 'swr'

import * as notificationServices from '~/services/notification'
import Button from '~/components/Button'
import CustomTippy from '~/components/CustomTippy'
import PopperWrapper from '~/components/PopperWrapper'
import config from '~/config'
import { NotificationData, NotificationResponse } from '~/type/type'
import { SendIcon } from '~/components/Icons'
import NotificationItem from './NotificationItem'
import { listenEvent } from '~/helpers/events'
import socket from '~/utils/socket'
import { NotificationEvent } from '~/enum/notification'

const Notification = () => {
    const [currentTab, setCurrentTab] = useState<'all' | 'unread'>('all')
    const [notificationUnSeenCount, setNotificationUnSeenCount] = useState(0)
    const [reloadNotificationCount, setReloadNotificationCount] = useState(true)

    const { data: notifications, mutate: mutateNotifications } = useSWR<NotificationResponse | undefined>(
        currentTab ? [config.apiEndpoint.notification.getNotifications, currentTab] : null,
        () => {
            return notificationServices.getNotifications({ page: 1, per_page: 10, type: currentTab })
        },
    )

    // Count notification
    useMemo(() => {
        if (!reloadNotificationCount) {
            return
        }

        const count = notifications?.data.reduce((acc: number, curr: NotificationData) => {
            return acc + (curr.is_seen ? 0 : 1)
        }, 0)

        if (count) {
            setNotificationUnSeenCount(count)
        }

        setReloadNotificationCount(false)
    }, [notifications?.data, reloadNotificationCount])

    const tippyInstanceRef = useRef<InstanceType<any>>(null)

    const notificationIcon = {
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

    interface Tab {
        name: string
        value: 'all' | 'unread'
    }

    const tabsMenu: Tab[] = [
        {
            name: 'Tất cả',
            value: 'all',
        },
        {
            name: 'Chưa đọc',
            value: 'unread',
        },
    ]

    const tippyShow = (instance: any) => {
        tippyInstanceRef.current = instance
    }

    const handleOpenNotification = () => {
        if (notificationUnSeenCount) {
            notificationServices.seen()
            setNotificationUnSeenCount(0)
        }
    }

    // Listen event new notification
    useEffect(() => {
        socket.on(NotificationEvent.NEW_NOTIFICATION, (newNotification: { notification: NotificationData }) => {
            if (!notifications) {
                return
            }

            mutateNotifications(
                {
                    data: [newNotification.notification, ...notifications.data],
                    meta: {
                        ...notifications?.meta,
                        pagination: {
                            ...notifications?.meta.pagination,
                            total: notifications.meta.pagination.total + 1,
                            count: notifications.meta.pagination.count + 1,
                        },
                    },
                },
                {
                    revalidate: false,
                },
            )

            setReloadNotificationCount(true)
        })
    }, [mutateNotifications, notifications])

    // Listen event when remove a notification

    useEffect(() => {
        socket.on(NotificationEvent.REMOVE_NOTIFICATION, ({ notificationId }: { notificationId: number }) => {
            if (!notifications) {
                return
            }

            const newNotifications = notifications.data.filter(
                (notification: NotificationData) => notification.id !== notificationId,
            )

            mutateNotifications(
                {
                    data: newNotifications,
                    meta: {
                        ...notifications?.meta,
                        pagination: {
                            ...notifications?.meta.pagination,
                            total: notifications.meta.pagination.total - 1,
                            count: notifications.meta.pagination.count - 1,
                        },
                    },
                },
                { revalidate: false },
            )

            setReloadNotificationCount(true)
        })
    }, [mutateNotifications, notifications])

    useEffect(() => {
        const remove = listenEvent({
            eventName: 'notification:update-read-status',
            handler: ({ detail: { notificationId, type } }) => {
                if (!notifications) {
                    return
                }

                const newNotifications = {
                    data: notifications?.data.map((notification: NotificationData) => ({
                        ...notification,
                        is_read: notification.id === notificationId ? type === 'read' : notification.is_read,
                    })),
                    meta: {
                        ...notifications?.meta,
                    },
                }

                mutateNotifications(newNotifications, { revalidate: false })
            },
        })

        return remove
    }, [mutateNotifications, notifications])

    useEffect(() => {
        const remove = listenEvent({
            eventName: 'notification:delete-notification',
            handler: ({ detail: notificationId }) => {
                const newNotifications = notifications?.data.filter(
                    (notification: NotificationData) => notification.id !== notificationId,
                )

                if (notifications) {
                    mutateNotifications(
                        {
                            data: newNotifications || [],
                            meta: {
                                pagination: {
                                    ...notifications?.meta.pagination,
                                    total: notifications.meta.pagination.total - 1,
                                    count: notifications.meta.pagination.count - 1,
                                },
                            },
                        },
                        {
                            revalidate: false,
                        },
                    )
                }
            },
        })

        return remove
    }, [mutateNotifications, notifications])

    useEffect(() => {
        const remove = listenEvent({
            eventName: 'tippy:hide',
            handler: () => {
                // Hide tippy when click on notification item
                tippyInstanceRef.current?.hide()
            },
        })

        return remove
    }, [currentTab])

    const renderNotification = () => {
        return (
            <PopperWrapper className="w-[400px] px-3 py-4">
                <header>
                    <h2 className="text-xl font-semibold">Thông báo</h2>
                    <div className="mt-4 flex items-center gap-2">
                        {tabsMenu.map((tab: Tab, index: number) => (
                            <Button
                                key={index}
                                buttonType={tab.value === currentTab ? 'primary' : 'rounded'}
                                className="!rounded-full py-[6px]"
                                onClick={() => setCurrentTab(tab.value)}
                            >
                                {tab.name}
                            </Button>
                        ))}
                    </div>
                </header>
                <main className="mt-2">
                    {notifications &&
                        notifications.data.map((notification: NotificationData) => {
                            return (
                                <React.Fragment key={notification.id}>
                                    <NotificationItem notification={notification} notificationIcon={notificationIcon} />
                                </React.Fragment>
                            )
                        })}
                </main>
            </PopperWrapper>
        )
    }

    return (
        <CustomTippy renderItem={renderNotification} onShow={tippyShow}>
            <div className="relative">
                <Button buttonType="icon" onClick={handleOpenNotification}>
                    <FontAwesomeIcon icon={faBell} className="text-lg sm:text-xl" />
                </Button>
                {notifications && notificationUnSeenCount !== 0 && (
                    <span className="flex-center absolute right-[-3px] top-[-3px] h-4 w-4 rounded-full bg-red-500 text-xs text-white">
                        {notificationUnSeenCount}
                    </span>
                )}
            </div>
        </CustomTippy>
    )
}

export default Notification
