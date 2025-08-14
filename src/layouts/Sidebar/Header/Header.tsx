'use client'

import React, { memo, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

import CreateConversationModal from './CreateConversationModal'
import { faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@tippyjs/react'
import Modal from '~/components/Modal'
import UserAvatar from '~/components/UserAvatar/UserAvatar'
import config from '~/config'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'

const Header: React.FC = () => {
    const router = useRouter()

    const currentUser = useAppSelector(getCurrentUser)

    const [isCreateConversationModalOpen, setIsCreateConversationModalOpen] = useState(false)

    const handleNavigateToProfile = useCallback(() => {
        router.push(`${config.routes.user}/@${currentUser?.data?.nickname}`)
    }, [currentUser?.data?.nickname, router])

    const handleCreateConversation = useCallback(() => {
        setIsCreateConversationModalOpen(true)
    }, [])

    const handleCloseModal = useCallback(() => {
        setIsCreateConversationModalOpen(false)
    }, [])

    return (
        <header className="p-1 pr-2">
            <Modal
                isOpen={isCreateConversationModalOpen}
                onClose={() => setIsCreateConversationModalOpen(false)}
                title="Tạo nhóm"
                popperClassName="w-[500px] max-w-[calc(100dvw-20px)] ![overflow:hidden] flex flex-col "
            >
                <CreateConversationModal onClose={handleCloseModal} />
            </Modal>
            <div className="flex w-full items-center justify-between">
                <>
                    <UserAvatar src={currentUser?.data?.avatar} onClick={handleNavigateToProfile} />
                    <h3 className="text-xl font-semibold dark:text-dark">Huấn cánh cụt</h3>

                    <Tippy content="Tạo nhóm" hideOnClick={true} placement="bottom-start">
                        <button
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-darkGray dark:text-dark dark:hover:opacity-90"
                            onClick={handleCreateConversation}
                        >
                            <FontAwesomeIcon icon={faUserGroup} className="text-xl" width={20} height={20} />
                        </button>
                    </Tippy>
                </>
            </div>
        </header>
    )
}

export default memo(Header)
