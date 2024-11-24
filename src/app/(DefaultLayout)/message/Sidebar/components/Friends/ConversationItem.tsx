import Link from 'next/link'
import UserAvatar from '~/components/UserAvatar'
import { ConversationModel } from '~/type/type'

interface Props {
    conversation: ConversationModel
    className?: string
}

const ConversationItem: React.FC<Props> = ({ conversation, className = '' }) => {
    return (
        <Link href={`/message/${conversation.uuid}`} className={`flex items-center py-2 ${className}`}>
            <UserAvatar src={conversation?.avatar || conversation.conversation_members[0].user.avatar} size={56} />
            <div className="ml-2">{conversation.name || conversation.conversation_members[0].user.full_name}</div>
        </Link>
    )
}

export default ConversationItem
