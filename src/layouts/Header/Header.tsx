'use client'

import React, { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faCircleDot, faMoon, faPen, faSignOut, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import useSWR from 'swr'
import { AxiosResponse } from 'axios'
import Skeleton from 'react-loading-skeleton'

import PopperWrapper from '~/components/PopperWrapper'
import Logo from '~/components/Logo'
import Button from '~/components/Button'
import UserAvatar from '~/components/UserAvatar'
import config from '~/config'
import * as authService from '~/services/authService'
import { UserResponse } from '~/type/type'
import NavLink from '~/components/NavLink'
import { HomeIcon, UserIcon } from '~/components/Icons'
import AccountItem from '~/components/AccountItem'
import MenuItem from '~/app/(DefaultLayout)/dashboard/@Sidebar/components/Header/MenuItem'
import CustomTippy from '~/components/CustomTippy'
import Tippy from '@tippyjs/react'

interface MenuItemType {
    icon: IconDefinition
    label: string
    line?: boolean
    switchButton?: boolean
}

const MENU_ITEMS: MenuItemType[] = [
    {
        icon: faMoon,
        label: 'Chế độ tối',
        switchButton: true,
    },
    {
        icon: faCircleDot,
        label: 'Trạng thái hoạt động',
    },
    {
        icon: faSignOut,
        label: 'Đăng xuất',
        line: true,
    },
]

export default function Header() {
    const pathname = usePathname()

    const { data: currentUser, isLoading } = useSWR<AxiosResponse<UserResponse>>(
        config.apiEndpoint.me.getCurrentUser,
        () => {
            return authService.getCurrentUser()
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
                icon: <UserIcon />,
                href: `/user/@${currentUser?.data?.data?.nickname}`,
                tooltip: 'Tài khoản',
            },
        ]
    }, [currentUser])

    const renderTooltip = () => {
        return (
            <PopperWrapper className="min-w-[320px] px-5 text-sm">
                <header className="p-2">
                    <h4 className="text-center font-semibold">Tùy chọn</h4>
                </header>
                <section>
                    <div className="border-b border-t border-gray-300 py-2 dark:border-gray-700">
                        <label className="font-semibold">Tài khoản</label>
                        <div className="flex items-center justify-between">
                            {currentUser && <AccountItem user={currentUser.data.data} className="mt-2" />}
                            <Button buttonType="icon">
                                <FontAwesomeIcon icon={faPen} className="text-sm" />
                            </Button>
                        </div>
                    </div>
                    <div className="mt-4">
                        {MENU_ITEMS.map((item: MenuItemType, index: number) => (
                            <React.Fragment key={index}>
                                <MenuItem item={item} />
                            </React.Fragment>
                        ))}
                    </div>
                </section>
            </PopperWrapper>
        )
    }

    return (
        <header className="fixed left-0 right-0 top-0 z-20 flex h-[var(--header-height)] w-full items-center justify-between px-3 shadow-sm shadow-[#0000001f] dark:bg-dark dark:text-dark dark:shadow-[#ffffff1f]">
            <Logo />

            <nav className="relative flex h-full items-center">
                {NAV_ITEMS.map((item, index) => {
                    return (
                        <Tippy content={item.tooltip} key={index}>
                            <div
                                className={`aspect-[12/9] h-full border-b-2 py-2 ${pathname === item.href ? 'border-b-2 border-primary' : 'border-transparent'}`}
                            >
                                <NavLink
                                    href={item.href}
                                    className={`flex-center h-full rounded-md text-xl hover:bg-[#a7a7a736] dark:hover:bg-[#313333]`}
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
                    <div className="relative">
                        <Button buttonType="icon">
                            <FontAwesomeIcon icon={faBell} className="text-xl" />
                        </Button>
                        <span className="flex-center absolute right-[-3px] top-[-3px] h-4 w-4 rounded-full bg-red-500 text-xs">
                            1
                        </span>
                    </div>
                )}
                <CustomTippy render={renderTooltip} renderItem={renderTooltip} placement="bottom-start" offsetY={10}>
                    <div>
                        {isLoading ? (
                            <Skeleton circle width={38} height={38} />
                        ) : (
                            <UserAvatar src={currentUser?.data?.data?.avatar} />
                        )}
                    </div>
                </CustomTippy>
            </div>
        </header>
    )
}
