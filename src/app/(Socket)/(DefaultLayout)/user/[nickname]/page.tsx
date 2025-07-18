'use client'

import { useEffect } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

import FriendList from './components/FriendList'
import User from './components/User'
import NotFound from '~/app/not-found'
import CustomImage from '~/components/Image'
import { SocketEvent } from '~/enum/SocketEvent'
import SWRKey from '~/enum/SWRKey'
import { listenEvent } from '~/helpers/events'
import socket from '~/helpers/socket'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import * as userService from '~/services/userService'
import { UserResponse, UserStatus } from '~/type/type'

export default function UserPage() {
    const { nickname } = useParams()

    const currentUser = useAppSelector(getCurrentUser)

    const {
        data: user,
        isLoading,
        mutate,
    } = useSWR<UserResponse | undefined>(
        nickname ? [SWRKey.GET_AN_USER, nickname] : SWRKey.GET_AN_USER,
        () => {
            return userService.getAnUser(nickname.slice(3) as string)
        },
        {
            revalidateOnMount: true,
        },
    )

    useEffect(() => {
        const socketHandler = (data: UserStatus) => {
            if (!user) {
                return
            }

            if (data.user_id === user.data.id) {
                mutate(
                    {
                        ...user,
                        data: {
                            ...user.data,
                            is_online: data.is_online,
                        },
                    },
                    {
                        revalidate: false,
                    },
                )
            }
        }

        socket.on(SocketEvent.USER_STATUS, socketHandler)

        return () => {
            socket.off(SocketEvent.USER_STATUS, socketHandler)
        }
    }, [mutate, user])

    useEffect(() => {
        const remove = listenEvent({
            eventName: 'friend:change-friend-status',
            handler: ({ detail }: { detail: { send_friend_request: boolean } }) => {
                if (!user?.data) {
                    return
                }

                const newData: UserResponse = {
                    ...user,
                    data: {
                        ...user.data,
                        ...detail,
                    },
                }

                mutate(newData, { revalidate: false })
            },
        })

        return remove
    }, [mutate, user])

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
        <div className="min-h-dvh bg-gray-100 pb-4 dark:bg-[#1c1c1d]">
            <header className="bg-white [box-shadow:1px_2px_4px_rgba(0,0,0,0.1)] dark:bg-dark">
                {user && currentUser ? (
                    <div className="w-1100px mx-auto max-w-[1100px]">
                        <CustomImage
                            src={
                                currentUser?.data.id === user.data.id
                                    ? currentUser?.data.cover_photo
                                    : user.data.cover_photo
                            }
                            fallback="/static/media/login-form.jpg"
                            alt="user"
                            className="aspect-[12/5] h-auto w-[1100px] rounded-lg object-cover"
                            style={{ width: '100%', height: 'auto' }}
                        />
                        {user && currentUser && <User currentUser={currentUser} user={user} />}
                        <div className="mt-0 w-full border-t border-gray-300 py-2 dark:border-zinc-700 sm:mt-10">
                            <button className="px-4 py-2 text-primary">Bạn bè</button>
                        </div>
                    </div>
                ) : !user && !isLoading ? (
                    <NotFound />
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
