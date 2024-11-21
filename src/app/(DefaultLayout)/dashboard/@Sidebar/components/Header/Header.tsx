'use client'

import React, { memo } from 'react'
import useSWR from 'swr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import * as meService from '~/services/meService'
import UserAvatar from '~/components/UserAvatar/UserAvatar'
import { UserResponse } from '~/type/type'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'
import Tippy from '@tippyjs/react'
import SWRKey from '~/enum/SWRKey'

const Header = () => {
    // fetch current user use swr
    const { data: currentUser } = useSWR<UserResponse | undefined>(SWRKey.GET_CURRENT_USER, () => {
        return meService.getCurrentUser()
    })

    return (
        <header className="p-3 sm:pr-6">
            <div className="flex w-full items-center justify-between">
                <>
                    <UserAvatar src={currentUser?.data?.avatar} />
                    <h3 className="text- text-xl font-semibold dark:text-dark">Huấn cánh cụt</h3>

                    <Tippy content="Hiện để cho đẹp :))))" hideOnClick={false} placement="bottom-start">
                        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-darkGray dark:text-dark dark:hover:opacity-90">
                            <FontAwesomeIcon icon={faEllipsis} className="text-xl" width={20} height={20} />
                        </button>
                    </Tippy>
                </>
            </div>
        </header>
    )
}

export default memo(Header)
