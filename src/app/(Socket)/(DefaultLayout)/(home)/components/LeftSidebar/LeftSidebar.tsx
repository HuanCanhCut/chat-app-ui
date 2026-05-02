'use client'

import Link from 'next/link'
import useSWR from 'swr'

import UserAvatar from '~/components/UserAvatar'
import config from '~/config'
import SWRKey from '~/enum/SWRKey'
import { selectCurrentUser } from '~/redux/selector'
import { useAppSelector } from '~/redux/types'
import * as conversationService from '~/services/conversationService'

const LeftSidebar = () => {
    const currentUser = useAppSelector(selectCurrentUser)

    const { data: penguinAI } = useSWR(SWRKey.GET_PENGUIN_AI_CONVERSATION, () => {
        return conversationService.getPenguinAIConversation()
    })

    return (
        <div className="pt-4">
            <Link href={`${config.routes.user}/@${currentUser?.data.nickname}`} className="flex items-center gap-2">
                <UserAvatar src={currentUser?.data.avatar} className="size-9" size={60} />

                <p className="font-medium">{currentUser?.data.full_name}</p>
            </Link>
            <Link href={`${config.routes.message}/${penguinAI?.data.uuid}`} className="mt-4 flex items-center gap-2">
                <UserAvatar
                    src={'https://res.cloudinary.com/dkmwrkngj/image/upload/v1759854156/dark-logo_e176mo.png'}
                    className="border-border size-9 border"
                    size={60}
                />

                <p className="font-medium">Penguin AI</p>
            </Link>
        </div>
    )
}

export default LeftSidebar
