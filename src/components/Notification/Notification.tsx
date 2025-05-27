import { faBell, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import useSWR from 'swr'

import * as notificationServices from '~/services/notificationService'
import Button from '~/components/Button/Button'
import CustomTippy from '~/components/CustomTippy/CustomTippy'
import PopperWrapper from '~/components/PopperWrapper'
import { NotificationData, NotificationResponse } from '~/type/type'
import { SendIcon } from '~/components/Icons/Icons'
import NotificationItem from './NotificationItem'
import { listenEvent } from '~/helpers/events'
import socket from '~/helpers/socket'
import { SocketEvent } from '~/enum/SocketEvent'
import Skeleton from 'react-loading-skeleton'
import SWRKey from '~/enum/SWRKey'

const PER_PAGE = 6

const Notification = () => {
    const [currentTab, setCurrentTab] = useState<'all' | 'unread'>('all')
    const [notificationUnSeenCount, setNotificationUnSeenCount] = useState(0)

    const [page, setPage] = useState(1)

    const {
        data: notifications,
        mutate: mutateNotifications,
        isLoading,
    } = useSWR<NotificationResponse | undefined>(
        currentTab ? [SWRKey.GET_NOTIFICATIONS, currentTab] : null,
        () => {
            return notificationServices.getNotifications({ page, per_page: PER_PAGE, type: currentTab })
        },
        {
            revalidateIfStale: true,
        },
    )

    // Count notification
    useMemo(() => {
        const count = notifications?.data.reduce((acc: number, curr: NotificationData) => {
            return acc + (curr.is_seen ? 0 : 1)
        }, 0)

        if (count) {
            setNotificationUnSeenCount(count)
        }
    }, [notifications])

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

            const newData = notifications?.data.map((notification: NotificationData) => ({
                ...notification,
                is_seen: true,
            }))

            if (newData) {
                mutateNotifications(
                    {
                        data: newData,
                        meta: notifications?.meta!,
                    },
                    { revalidate: false },
                )
            }

            setNotificationUnSeenCount(0)
        }
    }

    // Listen event new notification
    useEffect(() => {
        const socketHandler = (newNotification: { notification: NotificationData }) => {
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
        }

        socket.on(SocketEvent.NEW_NOTIFICATION, socketHandler)

        return () => {
            socket.off(SocketEvent.NEW_NOTIFICATION, socketHandler)
        }
    }, [mutateNotifications, notifications])

    useEffect(() => {
        const socketHandler = ({ notificationId }: { notificationId: number }) => {
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
        }

        socket.on(SocketEvent.REMOVE_NOTIFICATION, socketHandler)

        return () => {
            socket.off(SocketEvent.REMOVE_NOTIFICATION, socketHandler)
        }
    }, [mutateNotifications, notifications])

    useEffect(() => {
        const remove = listenEvent({
            eventName: 'notification:update-read-status',
            handler: ({ detail: { notificationId, type } }: { detail: { notificationId: number; type: string } }) => {
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

    const handleSeeMore = () => {
        setPage(page + 1)
    }

    useEffect(() => {
        if (page <= 1) {
            return
        }

        const getMoreNotifications = async () => {
            const response = await notificationServices.getNotifications({ page, per_page: PER_PAGE, type: currentTab })

            if (!notifications) {
                return
            }

            if (response) {
                mutateNotifications(
                    {
                        data: [...notifications.data, ...response.data],
                        meta: {
                            ...notifications?.meta,
                            pagination: {
                                ...notifications?.meta.pagination,
                                count: notifications.meta.pagination.count + response.meta.pagination.count,
                            },
                        },
                    },
                    {
                        revalidate: false,
                    },
                )
            }
        }

        getMoreNotifications()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page])

    const renderNotification = () => {
        return (
            <PopperWrapper className="w-[400px] px-3 py-4 [overflow:overlay]">
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
                    {notifications ? (
                        <>
                            {notifications.data.map((notification: NotificationData) => {
                                return (
                                    <React.Fragment key={notification.id}>
                                        <NotificationItem
                                            notification={notification}
                                            notificationIcon={notificationIcon}
                                        />
                                    </React.Fragment>
                                )
                            })}
                            {notifications.meta.pagination.count < notifications.meta.pagination.total && (
                                <Button buttonType="rounded" className="mt-4 w-full" onClick={handleSeeMore}>
                                    Xem thêm
                                </Button>
                            )}
                        </>
                    ) : (
                        isLoading && (
                            <>
                                {[1, 2, 3, 4, 5, 6].map((_, index) => {
                                    return (
                                        <div key={index} className="flex items-center gap-2">
                                            <Skeleton width={60} height={60} circle />
                                            <Skeleton width={300} height={20} />
                                        </div>
                                    )
                                })}
                            </>
                        )
                    )}
                </main>
            </PopperWrapper>
        )
    }

    return (
        <CustomTippy renderItem={renderNotification} onShow={tippyShow}>
            <div className="relative">
                <Button buttonType="icon" onClick={handleOpenNotification}>
                    <FontAwesomeIcon icon={faBell} className="text-lg sm:text-xl" width={20} height={20} />
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
