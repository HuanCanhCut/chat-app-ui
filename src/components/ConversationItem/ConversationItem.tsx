import Link from 'next/link'
import { useParams } from 'next/navigation'

import UserAvatar from '~/components/UserAvatar'
import { ConversationModel } from '~/type/type'
import { momentTimezone } from '~/utils/moment'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'

interface Props {
    conversation: ConversationModel
    className?: string
}

const ConversationItem: React.FC<Props> = ({ conversation, className = '' }) => {
    const currentUser = useAppSelector(getCurrentUser)
    const { uuid } = useParams()

    const isActive = uuid === conversation.uuid

    // if not group then get user !== current user in conversation_members
    const userMember = conversation.conversation_members.find((member) => member.user_id !== currentUser?.data.id)

    const isRead =
        conversation.last_message.sender_id !== currentUser?.data.id ? conversation.last_message.is_read : true

    return (
        <>
            <Link
                href={`/message/${conversation.uuid}`}
                className={`flex items-center rounded-lg p-2 pr-5 ${!isActive ? 'hover:bg-lightGray hover:dark:bg-darkGray' : ''} ${className} ${isActive ? 'bg-[#ebf5ff] dark:bg-[#222e39bd]' : ''}`}
            >
                <div className="relative flex-shrink-0">
                    <UserAvatar
                        src={conversation?.avatar || userMember?.user.avatar}
                        size={56}
                        className="h-[48px] w-[48px] lg:h-[56px] lg:w-[56px]"
                    />
                    {!conversation.is_group && userMember?.user.is_online && (
                        <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500 dark:border-dark"></div>
                    )}
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                    <p className="truncate font-medium">
                        {conversation.name || userMember?.nickname || userMember?.user.full_name}
                    </p>
                    <div
                        className={`flex items-center text-xs font-normal ${isRead ? 'text-gray-600 dark:text-gray-400' : 'font-medium text-black dark:text-gray-200'} `}
                    >
                        <span className="truncate pr-1">
                            {currentUser?.data.id === conversation.last_message?.sender_id
                                ? `Bạn: ${conversation.last_message?.content === null ? 'Đã thu hồi một tin nhắn' : conversation.last_message?.type === 'image' ? 'Đã gửi một hình ảnh' : conversation.last_message?.content}`
                                : `${!conversation.is_group ? '' : conversation.last_message?.sender.full_name + ': '} ${conversation.last_message?.content === null ? 'Đã thu hồi một tin nhắn' : conversation.last_message?.content}`}
                        </span>
                        <span className="flex-shrink-0">· {momentTimezone(conversation.last_message?.created_at)}</span>
                    </div>
                </div>
                {
                    <div className="relative h-5 w-10">
                        {(() => {
                            if (conversation.last_message.sender_id !== currentUser?.data.id) {
                                return null
                            }

                            // only show two user read message status
                            let readStatus = conversation.last_message.message_status.filter(
                                (status) => status.receiver_id !== currentUser?.data.id && status.status === 'read',
                            )

                            if (readStatus && Array.isArray(readStatus)) {
                                return readStatus.map((status, index) => {
                                    return (
                                        <UserAvatar
                                            key={index}
                                            src={status.receiver.avatar}
                                            size={16}
                                            className={`absolute h-5 w-5 rounded-full right-${index * 3} border-2 border-white dark:border-dark`}
                                        />
                                    )
                                })
                            }

                            return null
                        })()}
                    </div>
                }
            </Link>
        </>
    )
}

export default ConversationItem
