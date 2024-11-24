'use client'

import { useEffect, useState } from 'react'
import { ConversationModel } from '~/type/type'
import useSWR from 'swr'

import { usePathname, useRouter } from 'next/navigation'
import SWRKey from '~/enum/SWRKey'
import * as conversationServices from '~/services/conversationService'
import UserAvatar from '~/components/UserAvatar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'

interface HeaderProps {
    className?: string
    toggleInfo: () => void
}

const Header: React.FC<HeaderProps> = ({ className = '', toggleInfo }) => {
    const pathname = usePathname()
    const router = useRouter()

    // Get uuid from pathname
    const uuid = pathname.split('/')[2]
    const [currentConversation, setCurrentConversation] = useState<ConversationModel>()

    const { data: conversation } = useSWR(SWRKey.GET_CONVERSATIONS, () => {
        return conversationServices.getConversations({ page: 1 })
    })

    useEffect(() => {
        if (conversation?.data) {
            const currentConversation = conversation.data.find((conversation) => conversation.uuid === uuid)
            if (currentConversation) {
                setCurrentConversation(currentConversation)
            }
        }
    }, [conversation?.data, pathname, uuid])

    const handleNavigate = () => {
        if (!currentConversation?.is_group) {
            router.push(`/user/@${currentConversation?.conversation_members[0].user.nickname}`)
        }
    }

    return (
        <div
            className={`${className} flex items-center justify-between px-2 py-1 shadow-sm shadow-gray-200 dark:shadow-neutral-800`}
        >
            <div
                className="flex h-full cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-lightGray dark:hover:bg-darkGray"
                onClick={handleNavigate}
            >
                <UserAvatar
                    src={
                        currentConversation?.is_group
                            ? currentConversation.avatar
                            : currentConversation?.conversation_members[0].user.avatar
                    }
                    size={40}
                />
                <h4 className="font-semibold">
                    {currentConversation?.is_group
                        ? currentConversation.name
                        : currentConversation?.conversation_members[0].user.full_name}
                </h4>
            </div>
            <div className="flex items-center">
                <FontAwesomeIcon
                    icon={faCircleInfo}
                    width={24}
                    height={24}
                    className="cursor-pointer text-xl dark:text-gray-500"
                    onClick={toggleInfo}
                />
            </div>
        </div>
    )
}

export default Header
