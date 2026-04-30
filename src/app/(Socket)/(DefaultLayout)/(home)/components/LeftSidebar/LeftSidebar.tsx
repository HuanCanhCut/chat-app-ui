'use client'

import Link from 'next/link'

import UserAvatar from '~/components/UserAvatar'
import config from '~/config'
import { selectCurrentUser } from '~/redux/selector'
import { useAppSelector } from '~/redux/types'

const LeftSidebar = () => {
    const currentUser = useAppSelector(selectCurrentUser)

    return (
        <div className="pt-4">
            <Link href={`${config.routes.user}/@${currentUser?.data.nickname}`} className="flex items-center gap-2">
                <UserAvatar src={currentUser?.data.avatar} className="size-9" size={60} />

                <p className="font-medium">{currentUser?.data.full_name}</p>
            </Link>
            <div className="mt-4 flex items-center gap-2">
                <UserAvatar src={'/static/media/dark-logo.png'} className="size-9" size={60} />

                <p className="font-medium">Penguin AI</p>
            </div>
        </div>
    )
}

export default LeftSidebar
