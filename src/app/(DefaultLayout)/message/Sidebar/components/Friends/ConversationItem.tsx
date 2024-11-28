import Link from 'next/link'
import { useParams } from 'next/navigation'
import UserAvatar from '~/components/UserAvatar'
import { ConversationModel } from '~/type/type'

interface Props {
    conversation: ConversationModel
    className?: string
}

const ConversationItem: React.FC<Props> = ({ conversation, className = '' }) => {
    const { uuid } = useParams()

    const isActive = uuid === conversation.uuid

    // nếu không phải group thì lấy user đầu tiên trong conversation_members
    const userMember = conversation.conversation_members[0].user

    return (
        <>
            <Link
                href={`/message/${conversation.uuid}`}
                className={`flex items-center rounded-lg p-2 ${!isActive ? 'hover:bg-lightGray hover:dark:bg-darkGray' : ''} ${className} ${isActive ? 'bg-[#ebf5ff] dark:bg-[#222e39bd]' : ''}`}
            >
                <div className="relative">
                    <UserAvatar
                        src={conversation?.avatar || userMember.avatar}
                        size={56}
                        className="h-[48px] w-[48px] lg:h-[56px] lg:w-[56px]"
                    />
                    {!conversation.is_group && userMember.is_online && (
                        <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500 dark:border-dark"></div>
                    )}
                </div>
                <div className="ml-2">{conversation.name || userMember.full_name}</div>
            </Link>
        </>
    )
}

export default ConversationItem
