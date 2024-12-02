import Link from 'next/link'
import { useParams } from 'next/navigation'
import UserAvatar from '~/components/UserAvatar'
import { ConversationModel } from '~/type/type'
import { momentTimezone } from '~/utils/moment'
import getCurrentUser from '~/zustand/getCurrentUser'

interface Props {
    conversation: ConversationModel
    className?: string
}

const ConversationItem: React.FC<Props> = ({ conversation, className = '' }) => {
    const { currentUser } = getCurrentUser()

    const { uuid } = useParams()

    const isActive = uuid === conversation.uuid

    // nếu không phải group thì lấy user đầu tiên trong conversation_members
    const userMember = conversation.conversation_members[0].user

    return (
        <>
            <Link
                href={`/message/${conversation.uuid}`}
                className={`flex items-center rounded-lg p-2 pr-5 ${!isActive ? 'hover:bg-lightGray hover:dark:bg-darkGray' : ''} ${className} ${isActive ? 'bg-[#ebf5ff] dark:bg-[#222e39bd]' : ''}`}
            >
                <div className="relative flex-shrink-0">
                    <UserAvatar
                        src={conversation?.avatar || userMember.avatar}
                        size={56}
                        className="h-[48px] w-[48px] lg:h-[56px] lg:w-[56px]"
                    />
                    {!conversation.is_group && userMember.is_online && (
                        <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500 dark:border-dark"></div>
                    )}
                </div>
                <div className="ml-3 overflow-hidden">
                    <p className="truncate font-medium">{conversation.name || userMember.full_name}</p>
                    <div className="flex items-center text-xs font-normal text-gray-600 dark:text-gray-400">
                        <span className="truncate pr-1">
                            {currentUser?.data.id === conversation.messages[0]?.sender_id
                                ? `Bạn: ${conversation.messages[0]?.content}`
                                : `${!conversation.is_group ? '' : conversation.messages[0]?.sender.full_name + ': '} ${conversation.messages[0]?.content}`}
                        </span>
                        <span className="flex-shrink-0"> · {momentTimezone(conversation.messages[0]?.createdAt)}</span>
                    </div>
                </div>
            </Link>
        </>
    )
}

export default ConversationItem
