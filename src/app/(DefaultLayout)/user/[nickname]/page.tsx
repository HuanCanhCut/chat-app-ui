'use client'

import { AxiosResponse } from 'axios'
import Image from 'next/image'
import useSWR from 'swr'

import config from '~/config'
import { UserResponse } from '~/type/type'
import * as meService from '~/services/meService'
import * as userService from '~/services/userService'
import { useParams } from 'next/navigation'
import User from './components/User'
import FriendList from './components/FriendList'
import Skeleton from 'react-loading-skeleton'

export default function UserPage() {
    const { nickname } = useParams()

    const { data: currentUser } = useSWR<AxiosResponse<UserResponse>>(config.apiEndpoint.me.getCurrentUser, () => {
        return meService.getCurrentUser()
    })

    const { data: user, isLoading } = useSWR<AxiosResponse<UserResponse>>(
        nickname ? [config.apiEndpoint.user.getAnUser, nickname] : null,
        () => {
            return userService.getAnUser(nickname.slice(3) as string)
        },
    )

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
        <div className="min-h-screen pb-4">
            <header className="bg-gray-100 dark:bg-darkGray">
                {user?.status === 200 && currentUser?.status === 200 ? (
                    <div className="w-1100px mx-auto max-w-[1100px]">
                        <Image
                            src={
                                currentUser.data.data.id === user.data.data.id
                                    ? currentUser.data.data.cover_photo
                                    : user.data.data.cover_photo || '/static/media/login-form.jpg'
                            }
                            alt="user"
                            className="aspect-[12/5] h-auto w-[1100px] rounded-lg object-cover"
                            quality={100}
                            width="0"
                            height="0"
                            sizes="100vw"
                            priority
                            style={{ width: '100%', height: 'auto' }}
                        />
                        {user && currentUser && <User currentUser={currentUser} user={user} />}
                        <div className="mt-0 w-full border-t border-gray-300 py-2 dark:border-gray-700 sm:mt-10">
                            <button className="px-4 py-2 text-primary">Bạn bè</button>
                        </div>
                    </div>
                ) : user?.status !== 200 && !isLoading ? (
                    <div className="flex items-center justify-center">
                        <h1 className="text-2xl font-bold">User not found</h1>
                    </div>
                ) : (
                    <Loading />
                )}
            </header>
            {user ? (
                <FriendList user={user} />
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
