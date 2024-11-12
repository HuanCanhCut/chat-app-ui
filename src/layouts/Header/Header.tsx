'use client'

import React, { useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleDot, faMoon, faPen, faSignOut, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import useSWR from 'swr'
import Skeleton from 'react-loading-skeleton'
import Tippy from '@tippyjs/react'

import * as authService from '~/services/authService'
import PopperWrapper from '~/components/PopperWrapper/PopperWrapper'
import Logo from '~/components/Logo/Logo'
import Button from '~/components/Button/Button'
import UserAvatar from '~/components/UserAvatar/UserAvatar'
import config from '~/config'
import * as meService from '~/services/meService'
import { UserResponse } from '~/type/type'
import NavLink from '~/components/NavLink/NavLink'
import { HomeIcon, MessageIcon, UserGroupIcon } from '~/components/Icons/Icons'
import AccountItem from '~/components/AccountItem'
import MenuItem from './MenuItem'
import CustomTippy from '~/components/CustomTippy/CustomTippy'
import Notification from '../../components/Notification/Notification'
import { sendEvent } from '~/helpers/events'

export interface MenuItemType {
    type: 'theme' | 'status' | 'logout'
    icon: IconDefinition
    label: string
    line?: boolean
    switchButton?: boolean
}

const MENU_ITEMS: MenuItemType[] = [
    {
        type: 'theme',
        icon: faMoon,
        label: 'Chế độ tối',
        switchButton: true,
    },
    {
        type: 'status',
        icon: faCircleDot,
        label: 'Trạng thái hoạt động',
    },
    {
        type: 'logout',
        icon: faSignOut,
        label: 'Đăng xuất',
        line: true,
    },
]

export default function Header() {
    const pathname = usePathname()
    const router = useRouter()

    const { data: currentUser, isLoading } = useSWR<UserResponse | undefined>(
        config.apiEndpoint.me.getCurrentUser,
        () => {
            return meService.getCurrentUser()
        },
    )

    const NAV_ITEMS = useMemo(() => {
        return [
            {
                type: 'home',
                icon: <HomeIcon />,
                href: config.routes.dashboard,
                tooltip: 'Trang chủ',
            },
            {
                type: 'user',
                icon: <UserGroupIcon />,
                href: `/user/@${currentUser?.data?.nickname}`,
                tooltip: 'Tài khoản',
            },
        ]
    }, [currentUser])

    const handleChoose = (type: MenuItemType['type']) => {
        switch (type) {
            case 'logout':
                sendEvent({ eventName: 'tippy:hide' })
                authService.logout()

                router.push(config.routes.auth)
                router.refresh()
                break
        }
    }

    const renderTooltip = () => {
        return (
            <PopperWrapper className="min-w-[320px] text-sm">
                <header className="p-2">
                    <h4 className="text-center font-semibold">Tùy chọn</h4>
                </header>
                <section>
                    <div className="border-b border-t border-gray-300 px-5 py-2 dark:border-gray-700">
                        <label className="font-semibold">Tài khoản</label>
                        <div className="flex items-center justify-between">
                            {currentUser && <AccountItem user={currentUser?.data} className="mt-2" />}
                            <Button buttonType="icon" href={`/user/@${currentUser?.data?.nickname}`}>
                                <FontAwesomeIcon icon={faPen} className="text-sm" />
                            </Button>
                        </div>
                    </div>
                    <div className="mt-4">
                        {MENU_ITEMS.map((item: MenuItemType, index: number) => (
                            <React.Fragment key={index}>
                                <MenuItem item={item} onChoose={handleChoose} />
                            </React.Fragment>
                        ))}
                    </div>
                </section>
            </PopperWrapper>
        )
    }

    return (
        <header
            id="header"
            className="fixed left-0 right-0 top-0 z-20 flex h-[var(--header-height)] w-full items-center justify-between bg-white px-3 shadow-sm shadow-[#0000001f] dark:bg-darkGray dark:text-dark dark:shadow-[#ffffff1f]"
        >
            <Logo />

            <nav className="relative flex h-full items-center">
                {NAV_ITEMS.map((item, index) => {
                    return (
                        <Tippy content={item.tooltip} key={index}>
                            <div
                                className={`aspect-[1] h-full border-b-2 py-2 sm:aspect-[12/9] ${pathname === item.href ? 'border-b-2 border-primary' : 'border-transparent'}`}
                            >
                                <NavLink
                                    href={item.href}
                                    className={(nav) => {
                                        return `${nav.isActive ? 'text-primary' : ''} flex-center h-full rounded-md text-xl hover:bg-[#a7a7a736] dark:hover:bg-[#313333]`
                                    }}
                                >
                                    {item.icon}
                                </NavLink>
                            </div>
                        </Tippy>
                    )
                })}
            </nav>

            <div className="flex items-center gap-4">
                {isLoading ? (
                    <Skeleton circle width={38} height={38} />
                ) : (
                    <>
                        <Notification />
                        <Tippy content="Messenger">
                            <div>
                                <Button buttonType="icon" href={config.routes.dashboard}>
                                    <MessageIcon />
                                </Button>
                            </div>
                        </Tippy>
                    </>
                )}
                <CustomTippy
                    trigger="click"
                    renderItem={renderTooltip}
                    placement="bottom-start"
                    offsetY={10}
                    timeDelayOpen={50}
                    timeDelayClose={250}
                >
                    <div>
                        {isLoading ? (
                            <Skeleton circle width={38} height={38} />
                        ) : (
                            <UserAvatar src={currentUser?.data?.avatar} />
                        )}
                    </div>
                </CustomTippy>
            </div>
        </header>
    )
}
