import { useEffect, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'

import UserAvatar from '~/components/UserAvatar/UserAvatar'
import config from '~/config'
import SWRKey from '~/enum/SWRKey'
import handleApiError from '~/helpers/handleApiError'
import * as friendService from '~/services/friendService'
import { FriendsResponse, FriendsShip, UserResponse } from '~/type/type'

interface FriendListProps {
    user: UserResponse
}

const FriendList = ({ user }: FriendListProps) => {
    const [page, setPage] = useState(1)

    const { data: friends, mutate: mutateFriends } = useSWR<FriendsResponse | undefined>(
        user.data.nickname ? [SWRKey.GET_ALL_FRIENDS, user.data.nickname] : null,
        () => {
            return friendService.getFriends({ page, user_id: user.data.id })
        },
        {
            revalidateOnMount: true,
        },
    )

    useEffect(() => {
        let isLoading = false // Track if a page increment is in progress

        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight && !isLoading) {
                isLoading = true // Set loading to true to prevent further increments
                if (!friends) {
                    return
                }

                setPage((prevPage) => {
                    return prevPage >= friends.meta.pagination.total_pages ? prevPage : prevPage + 1
                })

                setTimeout(() => {
                    isLoading = false // Reset loading after a short delay
                }, 500) // Adjust the delay as needed
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [friends])

    useEffect(() => {
        if (page <= 1) {
            return
        }

        const getMoreFriends = async () => {
            try {
                const res = await friendService.getFriends({ page, user_id: user.data.id })

                if (!friends?.data) {
                    return
                }

                if (res) {
                    const newData: FriendsResponse = {
                        ...res,
                        data: [...friends.data, ...res.data],
                    }

                    mutateFriends(newData, {
                        revalidate: false,
                    })
                }
            } catch (error: any) {
                handleApiError(error)
            }
        }

        getMoreFriends()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page])

    return (
        <div className="mx-auto mt-4 max-w-[1100px] rounded-md bg-white p-4 [box-shadow:1px_2px_4px_rgba(0,0,0,0.1)] dark:bg-dark">
            <h2>Bạn bè</h2>
            <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {friends?.data?.map((friend: FriendsShip, index: number) => {
                    return (
                        <Link
                            href={`${config.routes.user}/@${friend.user.nickname}`}
                            key={index}
                            className="flex items-center rounded-md border border-zinc-200 px-2 py-4 dark:border-zinc-800"
                        >
                            <UserAvatar src={friend.user.avatar} className="rounded-lg" size={70} />
                            <div>
                                <h4 className="ml-4">{friend.user.full_name}</h4>
                                <p className="ml-4 text-xs text-gray-600 dark:text-gray-400">
                                    {friend.user.friends_count} nguời bạn
                                </p>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default FriendList
