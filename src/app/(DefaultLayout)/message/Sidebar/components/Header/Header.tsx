'use client'

import React, { memo, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'
import Tippy from '@tippyjs/react'
import { useRouter } from 'next/navigation'

import UserAvatar from '~/components/UserAvatar/UserAvatar'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'

const Header: React.FC = () => {
    const router = useRouter()

    const currentUser = useAppSelector(getCurrentUser)

    const handleNavigateToProfile = useCallback(() => {
        router.push(`/user/@${currentUser?.data?.nickname}`)
    }, [currentUser?.data?.nickname, router])

    return (
        <header className="p-1 pr-2">
            <div className="flex w-full items-center justify-between">
                <>
                    <UserAvatar src={currentUser?.data?.avatar} onClick={handleNavigateToProfile} />
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
