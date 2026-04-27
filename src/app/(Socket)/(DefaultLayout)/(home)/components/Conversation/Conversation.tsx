'use client'

import Link from 'next/link'
import useSWR from 'swr'

import UserAvatar from '~/components/UserAvatar'
import config from '~/config'
import SWRKey from '~/enum/SWRKey'
import { selectCurrentUser } from '~/redux/selector'
import { useAppSelector } from '~/redux/types'
import * as conversationServices from '~/services/conversationService'

const PER_PAGE = 20

const Conversation = () => {
    const currentUser = useAppSelector(selectCurrentUser)

    const { data: conversations } = useSWR(SWRKey.GET_HOME_CONVERSATION, () => {
        return conversationServices.getConversations({ page: 1, per_page: PER_PAGE })
    })

    return (
        <div className="flex flex-col">
            <p className="text-muted-foreground text-base leading-6 font-semibold">Người liên hệ</p>

            {conversations?.data?.map((conversation) => {
                const isGroup = conversation.is_group

                // Get one member (not me)
                const member = conversation.members?.find((member) => {
                    return member.user_id !== currentUser?.data.id
                })

                return (
                    <Link
                        href={`${config.routes.message}/${conversation.uuid}`}
                        key={conversation.id}
                        className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2"
                    >
                        {/* If group conversation, show group avatar, otherwise show member avatar (not me) */}
                        <UserAvatar
                            src={isGroup ? conversation.avatar : member?.user.avatar}
                            isOnline={isGroup ? false : member?.user.is_online}
                        />

                        {/* If conversation is group, display conversation name, otherwise display member name (not me) */}
                        <p className="line-clamp-1 truncate font-medium">
                            {isGroup ? conversation.name : member?.user.full_name}
                        </p>
                    </Link>
                )
            })}
        </div>
    )
}

export default Conversation
