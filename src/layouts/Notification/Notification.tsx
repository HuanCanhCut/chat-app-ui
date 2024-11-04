import { faBell, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useRef, useState } from 'react'

import * as notificationServices from '~/services/notification'
import Button from '~/components/Button'
import CustomTippy from '~/components/CustomTippy'
import PopperWrapper from '~/components/PopperWrapper'
import useSWR from 'swr'
import config from '~/config'
import { AxiosResponse } from 'axios'
import { NotificationData, NotificationResponse } from '~/type/type'
import { SendIcon } from '~/components/Icons'
import NotificationItem from './NotificationItem'
import { listenEvent } from '~/helpers/events'

const Notification = () => {
    const [currentTab, setCurrentTab] = useState<'all' | 'unread'>('all')
    const [isUpdateComment, setIsUpdateComment] = useState(false)

    const { data: notifications, mutate } = useSWR<AxiosResponse<NotificationResponse>>(
        currentTab ? [config.apiEndpoint.notification.getNotifications, currentTab] : null,
        () => {
            return notificationServices.getNotifications({ page: 1, per_page: 10, type: currentTab })
        },
    )

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

    useEffect(() => {
        const remove = listenEvent({
            eventName: 'notification:delete-notification',
            handler: () => {
                setIsUpdateComment(true)
            },
        })

        return remove
    }, [mutate])

    useEffect(() => {
        const remove = listenEvent({
            eventName: 'tippy:hide',
            handler: () => {
                // Hide tippy when click on notification item
                tippyInstanceRef.current?.hide()

                if (isUpdateComment) {
                    mutate()
                    setIsUpdateComment(false)
                }
            },
        })

        return remove
    }, [currentTab, mutate, isUpdateComment])

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
                    {notifications?.status === 200 &&
                        notifications.data.data.map((notification: NotificationData) => {
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
                <Button buttonType="icon">
                    <FontAwesomeIcon icon={faBell} className="text-lg sm:text-xl" />
                </Button>
                {notifications?.status === 200 && notifications?.data?.meta.pagination.total > 0 && (
                    <span className="flex-center absolute right-[-3px] top-[-3px] h-4 w-4 rounded-full bg-red-500 text-xs text-white">
                        {notifications?.data?.meta.pagination.total}
                    </span>
                )}
            </div>
        </CustomTippy>
    )
}

export default Notification
