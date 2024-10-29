import { AxiosResponse } from 'axios'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

import * as friendsService from '~/services/friendsService'
import UserAvatar from '~/components/UserAvatar'
import config from '~/config'
import { FriendsResponse, FriendsShip, UserResponse } from '~/type/type'
import Link from 'next/link'

interface FriendListProps {
    user: AxiosResponse<UserResponse>
}

const FriendList = ({ user }: FriendListProps) => {
    const { nickname } = useParams()
    const [page, setPage] = useState(1)

    const { data: friends, mutate: mutateFriends } = useSWR<AxiosResponse<FriendsResponse>>(
        nickname ? [config.apiEndpoint.friend.getAllFriends, nickname] : null,
        () => {
            return friendsService.getFriends({ page, user_id: user.data.data.id })
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
                    return prevPage >= friends.data.meta.pagination.total_pages ? prevPage : prevPage + 1
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
            const res = await friendsService.getFriends({ page, user_id: user.data.data.id })

            if (!friends?.data.data) {
                return
            }

            if (res.status === 200) {
                const newData: AxiosResponse<FriendsResponse> = {
                    ...res,
                    data: {
                        ...res.data,
                        data: [...friends.data.data, ...res.data.data],
                    },
                }

                mutateFriends(newData, {
                    revalidate: false,
                })
            }
        }

        getMoreFriends()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page])

    return (
        <div className="mx-auto mt-4 max-w-[1100px] rounded-md bg-gray-100 p-4 dark:bg-darkGray">
            <h2>Bạn bè</h2>
            <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {friends?.data?.data?.map((friend: FriendsShip, index: number) => {
                    return (
                        <Link
                            href={`/user/@${friend.user.nickname}`}
                            key={index}
                            className="flex items-center rounded-md border border-gray-200 px-2 py-4 dark:border-gray-800"
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
