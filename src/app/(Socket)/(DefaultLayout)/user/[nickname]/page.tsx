'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

import UserAvatar from '~/components/UserAvatar'
import config from '~/config'
import SWRKey from '~/enum/SWRKey'
import { selectCurrentUser } from '~/redux/selector'
import { useAppSelector } from '~/redux/types'
import * as friendService from '~/services/friendService'
import * as userService from '~/services/userService'

const ProfilePage = () => {
    const { nickname } = useParams()

    const currentUser = useAppSelector(selectCurrentUser)

    const { data: user } = useSWR(
        nickname ? [SWRKey.GET_AN_USER, nickname] : SWRKey.GET_AN_USER,
        () => {
            return userService.getAnUser(nickname?.slice(3) as string)
        },
        {
            revalidateOnMount: true,
        },
    )

    const { data: friends } = useSWR(
        user?.data.nickname ? [SWRKey.GET_ALL_FRIENDS, user?.data.nickname] : null,
        () => {
            return friendService.getFriends({ page: 1, user_id: user?.data.id ?? 0, per_page: 9 }) // only show 9 friends on profile page
        },
        {
            revalidateOnMount: true,
        },
    )

    return (
        <div className="mt-4 grid grid-cols-12">
            <div className="col-span-5">
                <div className="dark:bg-dark rounded-md bg-white p-3">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="font-semibold">Bạn bè</h3>
                            <p className="text-muted-foreground">{friends?.meta.pagination.total} người bạn</p>
                        </div>
                        <Link href={config.routes.user_friends.replace(':nickname', `@${user?.data.nickname}`)}>
                            <p className="text-blue-link hover:underline">Xem tất cả bạn bè</p>
                        </Link>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                        {friends?.data.slice(0, 9).map((friend) => {
                            return (
                                <Link href={`${config.routes.user}/@${friend.user.nickname}`} key={friend.id}>
                                    <UserAvatar src={friend.user.avatar} size={200} className="w-full rounded-md" />
                                    <p className="mt-0.5 max-w-full truncate text-sm font-medium wrap-break-word hover:underline">
                                        {friend.user.full_name}
                                    </p>
                                    {friend.user.id !== currentUser?.data.id && (
                                        <p className="text-muted-foreground text-xs">
                                            {friend.user.mutual_friends_count} bạn chung
                                        </p>
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
