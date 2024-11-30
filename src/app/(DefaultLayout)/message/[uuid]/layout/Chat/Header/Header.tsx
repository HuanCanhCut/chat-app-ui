'use client'

import { useEffect, useState } from 'react'
import { ConversationModel } from '~/type/type'
import useSWR from 'swr'

import { usePathname, useRouter } from 'next/navigation'
import SWRKey from '~/enum/SWRKey'
import * as conversationServices from '~/services/conversationService'
import UserAvatar from '~/components/UserAvatar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faCircleInfo } from '@fortawesome/free-solid-svg-icons'

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

    // nếu không phải group thì lấy user đầu tiên trong conversation_members
    const conversationMember = currentConversation?.conversation_members[0].user

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
            <div className="flex items-center">
                <div
                    className="flex-center cursor-pointer rounded-lg px-1 py-1 hover:bg-lightGray dark:hover:bg-darkGray md:hidden"
                    onClick={() => router.push('/message')}
                >
                    <FontAwesomeIcon
                        icon={faChevronLeft}
                        className="text-xl dark:text-gray-500"
                        width={22}
                        height={22}
                    />
                </div>
                <div
                    className="flex h-full cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-lightGray dark:hover:bg-darkGray"
                    onClick={handleNavigate}
                >
                    <div className="relative flex-shrink-0">
                        <UserAvatar
                            src={
                                currentConversation?.is_group ? currentConversation.avatar : conversationMember?.avatar
                            }
                            size={40}
                        />
                        {!currentConversation?.is_group && conversationMember?.is_online && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-dark"></div>
                        )}
                    </div>
                    <div>
                        <h4 className="max-w-[150px] truncate whitespace-nowrap font-semibold xs:max-w-[200px] sm:max-w-[250px] md:max-w-[350px]">
                            {currentConversation?.is_group ? currentConversation.name : conversationMember?.full_name}
                        </h4>
                        {!currentConversation?.is_group && conversationMember?.is_online && (
                            <span className="text-xs font-normal text-gray-700 dark:text-gray-400">Đang hoạt động</span>
                        )}
                    </div>
                </div>
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
