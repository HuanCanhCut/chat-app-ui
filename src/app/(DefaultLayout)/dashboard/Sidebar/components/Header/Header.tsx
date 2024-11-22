'use client'

import React, { memo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import UserAvatar from '~/components/UserAvatar/UserAvatar'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'
import Tippy from '@tippyjs/react'
import Search from './Search'
import getCurrentUser from '~/zustand/getCurrentUser'

interface Props {
    setSearchMode: (value: boolean) => void
    searchMode: boolean
}

const Header: React.FC<Props> = ({ setSearchMode, searchMode }) => {
    const { currentUser } = getCurrentUser()

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
            <Search setSearchMode={setSearchMode} searchMode={searchMode} />
        </header>
    )
}

export default memo(Header)
