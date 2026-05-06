'use client'

import InfiniteScroll from 'react-infinite-scroll-component'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import useSWR from 'swr'

import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import UserAvatar from '~/components/UserAvatar/UserAvatar'
import config from '~/config'
import SWRKey from '~/enum/SWRKey'
import * as friendService from '~/services/friendService'
import * as userService from '~/services/userService'
import { FriendsResponse, FriendsShip } from '~/type/type'

const FriendPage = () => {
    const { nickname } = useParams()

    const { data: user } = useSWR(
        nickname ? [SWRKey.GET_AN_USER, nickname] : SWRKey.GET_AN_USER,
        () => {
            return userService.getAnUser(nickname?.slice(3) as string)
        },
        {
            revalidateOnMount: true,
        },
    )

    const { data: friends, mutate: mutateFriends } = useSWR<FriendsResponse | undefined>(
        user?.data.nickname ? [SWRKey.GET_ALL_FRIENDS, user?.data.nickname] : null,
        () => {
            return friendService.getFriends({ page: 1, user_id: user?.data.id ?? 0 })
        },
        {
            revalidateOnMount: true,
        },
    )

    return (
        <div className="mt-2">
            <Link
                href={config.routes.user_friends_invite.replace(':nickname', `@${user?.data.nickname}`)}
                className="text-blue-link mr-2 ml-auto block w-fit text-right hover:underline"
            >
                Lời mời kết bạn
            </Link>

            <InfiniteScroll
                dataLength={friends?.data.length || 0}
                next={async () => {
                    try {
                        if (!friends?.data) {
                            return
                        }

                        const res = await friendService.getFriends({
                            page: (friends?.meta.pagination.current_page ?? 0) + 1,
                            user_id: user?.data.id ?? 0,
                        })

                        if (!res) {
                            return
                        }

                        const newData = {
                            ...friends,
                            data: [...friends.data, ...res.data],
                            meta: {
                                ...friends.meta,
                                pagination: {
                                    ...res.meta.pagination,
                                },
                            },
                        }

                        mutateFriends(newData, false)
                    } catch (error) {
                        toast.error('Lỗi khi tải thêm bạn')
                    }
                }}
                className="mt-2 grid grid-cols-1 gap-3 overflow-hidden! md:grid-cols-2"
                hasMore={(friends?.meta.pagination.current_page ?? 0) < (friends?.meta.pagination.total_pages ?? 0)}
                scrollThreshold={0.8}
                loader={
                    <div className="flex justify-center">
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    </div>
                }
            >
                {friends?.data?.map((friend: FriendsShip, index: number) => {
                    return (
                        <Link
                            href={`${config.routes.user}/@${friend.user?.nickname}`}
                            key={index}
                            className="flex items-center overflow-hidden rounded-md border border-zinc-200 px-2 py-4 dark:border-zinc-800"
                        >
                            <UserAvatar
                                src={friend.user?.avatar}
                                className="xxs::min-w-[70px] w-20 rounded-md"
                                size={70}
                            />
                            <div className="ml-4 flex-1 overflow-hidden">
                                <h4 className="truncate font-semibold">{friend.user?.full_name}</h4>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {friend.user?.mutual_friends_count} bạn chung
                                    </p>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </InfiniteScroll>
        </div>
    )
}

export default FriendPage
