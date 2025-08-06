import { useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import AvatarGroup from '../AvatarGroup'
import Button from '../Button'
import CustomTippy from '../CustomTippy'
import EmojiMessageStyle from '../EmojiMessageStyle'
import ConversationOptions from './ConversationOptions'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import UserAvatar from '~/components/UserAvatar'
import SystemMessage from '~/layouts/Chat/Message/SystemMessage'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import { ConversationModel, MessageModel } from '~/type/type'
import { momentTimezone } from '~/utils/moment'

interface Props {
    conversation: ConversationModel
    className?: string
}

const ConversationItem: React.FC<Props> = ({ conversation, className = '' }) => {
    const currentUser = useAppSelector(getCurrentUser)

    const tippyInstanceRef = useRef<any>(null)

    const { uuid } = useParams()

    const isActive = uuid === conversation.uuid

    // if not group then get user !== current user in conversation_members
    const userMember = conversation.members.find((member) => member.user_id !== currentUser?.data.id)

    const isRead =
        conversation.last_message.sender_id !== currentUser?.data.id ? !!conversation.last_message.is_read : true

    const content = (message: MessageModel) => {
        let content = ''

        const messageType = new Map<string | null, string>([
            [null, 'Đã thu hồi một tin nhắn'],
            ['image', 'Đã gửi một ảnh'],
        ])

        if (currentUser?.data.id === message.sender_id) {
            content += 'Bạn: '
        } else {
            if (conversation.is_group) {
                content += `${message.sender.full_name}: `
            }
        }

        const type = message.content !== null ? message.type : null

        return (content += messageType.has(type) ? messageType.get(type) : message?.content)
    }

    // check if last message is system message and block current user
    const isMessageBlocked = () => {
        if (conversation.last_message.type === 'system_remove_user') {
            const regex = /\{(.*?)\}/g

            for (const match of conversation.last_message.content?.matchAll(regex) || []) {
                const json = match[0]

                interface JsonParsed {
                    user_id: string | number
                    name: string
                }

                const jsonParsed: JsonParsed = JSON.parse(json)

                const matchIndex = match.index || 0

                if (Number(jsonParsed.user_id) === currentUser?.data.id) {
                    return matchIndex > 0
                }
            }
        }
    }

    return (
        <div
            className={`group relative rounded-lg ${!isActive ? 'hover:bg-lightGray hover:dark:bg-darkGray' : ''} ${className} ${isActive ? 'bg-[#ebf5ff] dark:bg-[#222e39bd]' : ''}`}
        >
            <Link href={`/message/${conversation.uuid}`} className={`flex items-center p-2 pr-5`}>
                <div className="relative flex-shrink-0">
                    <UserAvatar
                        src={conversation.is_group ? conversation.avatar : userMember?.user.avatar}
                        size={56}
                        className="h-[48px] w-[48px] lg:h-[56px] lg:w-[56px]"
                        isOnline={!conversation.is_group && userMember?.user.is_online}
                        onlineClassName="h-4 w-4"
                    />
                </div>
                <div className="ml-3 flex-1 overflow-hidden pr-2">
                    <p className="truncate font-medium">
                        {conversation.name || userMember?.nickname || userMember?.user.full_name}
                    </p>
                    <div
                        className={`flex items-center text-[13px] font-normal [&_*]:text-[13px] ${isRead || isMessageBlocked() ? '[&_*]:text-gray-600 dark:[&_*]:text-gray-400' : '[&_*]:text-black dark:[&_*]:text-gray-200'}`}
                    >
                        <span className={`truncate pr-1 [&>p]:w-auto`}>
                            {conversation.last_message.type.startsWith('system') ? (
                                <SystemMessage
                                    message={conversation.last_message}
                                    messageIndex={-1}
                                    className={`[&_p]:line-clamp-1 [&_p]:w-full [&_p]:truncate [&_p]:text-ellipsis`}
                                    hiddenQuickAction={true}
                                />
                            ) : (
                                <EmojiMessageStyle
                                    text={content(conversation.last_message)}
                                    className="ml-1"
                                    textClassName="truncate line-clamp-1 text-ellipsis flex-1 w-full"
                                />
                            )}
                        </span>
                        <span className="flex-shrink-0 text-[13px]">
                            · {momentTimezone(conversation.last_message?.created_at)}
                        </span>
                    </div>
                </div>
                {
                    <div>
                        {(() => {
                            if (conversation.last_message.sender_id !== currentUser?.data.id) {
                                return null
                            }

                            // only show two user read message status
                            let readStatus = conversation.last_message.message_status.filter(
                                (status) => status.receiver_id !== currentUser?.data.id && status.status === 'read',
                            )

                            if (readStatus && Array.isArray(readStatus)) {
                                const avatars: string[] = readStatus.map((status) => status.receiver.avatar)

                                return (
                                    <AvatarGroup
                                        avatars={avatars.slice(0, 2)}
                                        size={16}
                                        translate={3}
                                        className="flex h-5 items-center gap-2 [&>img]:h-5 [&>img]:w-5 [&>img]:border-2 [&>img]:border-white [&>img]:dark:border-dark"
                                        style={{
                                            width: `${16 * avatars.slice(0, 2).length}px`,
                                        }}
                                    />
                                )
                            }

                            return null
                        })()}
                    </div>
                }
            </Link>
            <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 group-hover:block">
                <CustomTippy
                    renderItem={() => (
                        <ConversationOptions conversation={conversation} tippyInstanceRef={tippyInstanceRef} />
                    )}
                    placement="bottom"
                    onShow={(instance) => {
                        tippyInstanceRef.current = instance
                    }}
                >
                    <div>
                        <Button
                            buttonType="icon"
                            className="group:hover:shadow-lg z-10 border border-gray-300 dark:border-zinc-700"
                        >
                            <FontAwesomeIcon icon={faEllipsis} className="text-xl" />
                        </Button>
                    </div>
                </CustomTippy>
            </div>
        </div>
    )
}

export default ConversationItem
