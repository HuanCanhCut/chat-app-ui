'use client'

import React, { memo } from 'react'
import useSWR from 'swr'
import Skeleton from 'react-loading-skeleton'
import { AxiosResponse } from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleDot, faEllipsis, faMoon, faPen, faSignOut } from '@fortawesome/free-solid-svg-icons'

import config from '~/config'
import * as authService from '~/services/authService'
import UserAvatar from '~/components/UserAvatar'
import { UserModel } from '~/type/type'
import Search from '~/components/Search'
import CustomTippy from '~/components/CustomTippy'
import PopperWrapper from '~/components/PopperWrapper'
import AccountItem from '~/components/AccountItem'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import MenuItem from './MenuItem'
import Button from '~/components/Button'

interface Response {
    data: UserModel
    meta?: {
        pagination: {
            exp: number
        }
    }
}

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

const Header = () => {
    // fetch current user use swr
    const { data: currentUser, isLoading } = useSWR<AxiosResponse<Response>>(config.apiEndpoint.auth.me, () => {
        return authService.getCurrentUser()
    })

    // define config framer-motion

    const Loading = () => {
        return (
            <>
                <Skeleton circle width={32} height={32} />
                <Skeleton width={150} height={20} />
                <Skeleton circle width={40} height={40} />
            </>
        )
    }

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
                            {/* <button className="flex-center h-9 w-9 rounded-full bg-gray-100">
                                <FontAwesomeIcon icon={faPen} className="text-sm" />
                            </button> */}
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
        <header className="p-3 sm:pr-6">
            <div className="flex w-full items-center justify-between">
                {!isLoading ? (
                    <>
                        <UserAvatar src={currentUser?.data?.data?.avatar} />
                        <h3 className="text- text-xl font-semibold dark:text-dark">Huấn cánh cụt</h3>
                        <CustomTippy
                            render={renderTooltip}
                            renderItem={renderTooltip}
                            placement="bottom-start"
                            offsetY={10}
                        >
                            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-darkGray dark:text-dark dark:hover:opacity-90">
                                <FontAwesomeIcon icon={faEllipsis} className="text-xl" />
                            </button>
                        </CustomTippy>
                    </>
                ) : (
                    <Loading />
                )}
            </div>
            {!isLoading ? (
                <Search placeholder="Tìm kiếm trên Huấn Cánh Cụt" />
            ) : (
                <Skeleton height={20} className="rounded-4xl mt-3 w-full p-4" />
            )}
        </header>
    )
}

export default memo(Header)
