'use client'

import { useRouter } from 'next/navigation'
import UserAvatar from '~/components/UserAvatar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { ConversationModel } from '~/type/type'
import getCurrentUser from '~/zustand/getCurrentUser'

interface HeaderProps {
    className?: string
    toggleInfo: () => void
    conversation: ConversationModel | undefined
}

const Header: React.FC<HeaderProps> = ({ className = '', toggleInfo, conversation }) => {
    const { currentUser } = getCurrentUser()
    const router = useRouter()

    const handleNavigate = () => {
        if (!conversation?.is_group) {
            const member = conversation?.conversation_members.find((member) => member.user_id !== currentUser?.data.id)

            router.push(`/user/@${member?.user.nickname}`)
        }
    }

    const conversationMember = conversation?.conversation_members.find(
        (member) => member.user_id !== currentUser?.data.id,
    )?.user

    return (
        <div
            className={`${className} flex items-center justify-between px-2 py-1 shadow-sm shadow-gray-200 dark:shadow-neutral-800`}
        >
            <div className="flex items-center">
                <div
                    className="flex-center cursor-pointer rounded-lg px-1 py-1 hover:bg-lightGray dark:hover:bg-darkGray bp900:hidden"
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
                            src={conversation?.is_group ? conversation?.avatar : conversationMember?.avatar}
                            size={40}
                        />
                        {!conversation?.is_group && conversationMember?.is_online && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-dark"></div>
                        )}
                    </div>
                    <div>
                        <h4 className="max-w-[150px] truncate whitespace-nowrap font-semibold xs:max-w-[200px] sm:max-w-[250px] md:max-w-[350px]">
                            {conversation?.is_group ? conversation?.name : conversationMember?.full_name}
                        </h4>
                        {!conversation?.is_group && conversationMember?.is_online && (
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
