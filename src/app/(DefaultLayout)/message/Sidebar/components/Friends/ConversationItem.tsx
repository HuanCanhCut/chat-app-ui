import Link from 'next/link'
import { usePathname } from 'next/navigation'
import UserAvatar from '~/components/UserAvatar'
import { ConversationModel } from '~/type/type'

interface Props {
    conversation: ConversationModel
    className?: string
}

const ConversationItem: React.FC<Props> = ({ conversation, className = '' }) => {
    const pathname = usePathname()
    const isActive = pathname.includes(conversation.uuid)

    return (
        <>
            <Link
                href={`/message/${conversation.uuid}`}
                className={`flex items-center rounded-lg p-2 ${!isActive ? 'hover:bg-lightGray hover:dark:bg-darkGray' : ''} ${className} ${isActive ? 'bg-[#ebf5ff] dark:bg-[#222e39bd]' : ''}`}
            >
                <UserAvatar
                    src={conversation?.avatar || conversation.conversation_members[0].user.avatar}
                    size={56}
                    className="h-[48px] w-[48px] lg:h-[56px] lg:w-[56px]"
                />
                <div className="ml-2">{conversation.name || conversation.conversation_members[0].user.full_name}</div>
            </Link>
        </>
    )
}

export default ConversationItem
