'use client'

import React, { memo } from 'react'
import useSWR from 'swr'
import Skeleton from 'react-loading-skeleton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import config from '~/config'
import * as meService from '~/services/meService'
import UserAvatar from '~/components/UserAvatar/UserAvatar'
import { UserResponse } from '~/type/type'
import Search from '~/components/Search/Search'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'
import Tippy from '@tippyjs/react'

const Header = () => {
    // fetch current user use swr
    const { data: currentUser, isLoading } = useSWR<UserResponse | undefined>(
        config.apiEndpoint.me.getCurrentUser,
        () => {
            return meService.getCurrentUser()
        },
    )

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

    return (
        <header className="p-3 sm:pr-6">
            <div className="flex w-full items-center justify-between">
                {!isLoading ? (
                    <>
                        <UserAvatar src={currentUser?.data?.avatar} />
                        <h3 className="text- text-xl font-semibold dark:text-dark">Huấn cánh cụt</h3>

                        <Tippy content="Hiện để cho đẹp :))))" hideOnClick={false} placement="bottom-start">
                            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-darkGray dark:text-dark dark:hover:opacity-90">
                                <FontAwesomeIcon icon={faEllipsis} className="text-xl" />
                            </button>
                        </Tippy>
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
