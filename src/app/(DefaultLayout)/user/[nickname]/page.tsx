'use client'

import { useEffect, useState } from 'react'
import { AxiosResponse } from 'axios'
import Image from 'next/image'
import useSWR from 'swr'

import config from '~/config'
import { FriendsResponse, UserResponse } from '~/type/type'
import * as friendsService from '~/services/friendsService'
import * as authService from '~/services/authService'
import * as userService from '~/services/userService'
import { useParams } from 'next/navigation'
import User from './components/User'
import FriendList from './components/FriendList'
import Button from '~/components/Button'
import Skeleton from 'react-loading-skeleton'

export default function UserPage() {
    const { nickname } = useParams()
    const [page, setPage] = useState(1)

    const { data: friends } = useSWR<AxiosResponse<FriendsResponse>>(config.apiEndpoint.friend.getAllFriends, () => {
        return friendsService.getFriends({ page })
    })

    const { data: currentUser } = useSWR<AxiosResponse<UserResponse>>(config.apiEndpoint.me.getCurrentUser, () => {
        return authService.getCurrentUser()
    })

    const { data: user, mutate: mutateUser } = useSWR<AxiosResponse<UserResponse>>(
        config.apiEndpoint.user.getAnUser,
        () => {
            return userService.getAnUser(nickname.slice(3) as string)
        },
        {
            revalidateOnFocus: true,
        },
    )

    useEffect(() => {
        mutateUser()
    }, [nickname, mutateUser])

    const Loading = () => {
        return (
            <div className="w-1100px mx-auto max-w-[1100px]">
                <Skeleton className="aspect-[12/5] h-auto w-[1100px] rounded-lg object-cover" />
                <div className="relative w-full px-6 py-4 sm:flex sm:items-center">
                    <Skeleton
                        circle
                        width={130}
                        height={130}
                        className="absolute top-[-100px] w-[130px] border-4 border-white dark:border-[#242526] sm:top-[-30px]"
                    />
                    <div className="top-[50px] flex-1">
                        <Skeleton height={24} width={200} />
                        <Skeleton height={14} width={200} />
                        <Skeleton height={14} width={200} />
                    </div>
                    <div>
                        <Skeleton height={35} width={200} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <header className="bg-gray-100 dark:bg-darkGray">
                {user && currentUser && friends ? (
                    <div className="w-1100px mx-auto max-w-[1100px]">
                        <Image
                            src="https://hoanghamobile.com/tin-tuc/wp-content/uploads/2023/07/anh-bia-dep-10.jpg"
                            alt="user"
                            className="aspect-[12/5] h-auto w-[1100px] rounded-lg object-cover"
                            quality={100}
                            width="0"
                            height="0"
                            sizes="100vw"
                            priority
                            style={{ width: '100%', height: 'auto' }}
                        />
                        {friends && user && currentUser && (
                            <User friends={friends} currentUser={currentUser} user={user} />
                        )}
                        <div className="mt-0 w-full border-t border-gray-300 py-2 dark:border-gray-700 sm:mt-10">
                            <button className="px-4 py-2 text-primary">Bạn bè</button>
                        </div>
                    </div>
                ) : (
                    <Loading />
                )}
            </header>
            {friends ? (
                <FriendList friends={friends} />
            ) : (
                <div className="mx-auto mt-4 max-w-[1100px]">
                    <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </div>
            )}
        </div>
    )
}
