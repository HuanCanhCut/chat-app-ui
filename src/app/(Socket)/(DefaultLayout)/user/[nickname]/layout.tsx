'use client'

import { useEffect } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

import User from './components/User'
import NotFound from '~/app/not-found'
import CustomImage from '~/components/Image'
import NavLink from '~/components/NavLink'
import config from '~/config'
import SWRKey from '~/enum/SWRKey'
import { listenEvent } from '~/helpers/events'
import socket from '~/helpers/socket'
import { cn } from '~/lib/utils'
import { selectCurrentUser } from '~/redux/selector'
import { useAppSelector } from '~/redux/types'
import * as userService from '~/services/userService'
import { UserResponse } from '~/type/type'

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const { nickname } = useParams()

    const currentUser = useAppSelector(selectCurrentUser)

    const {
        data: user,
        isLoading,
        mutate,
    } = useSWR<UserResponse | undefined>(
        nickname ? [SWRKey.GET_AN_USER, nickname] : SWRKey.GET_AN_USER,
        () => {
            return userService.getAnUser(nickname?.slice(3) as string)
        },
        {
            revalidateOnMount: true,
        },
    )

    useEffect(() => {
        const socketHandler = (data: { user_id: number; is_online: boolean; last_online_at: string | null }) => {
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

        socket.on('USER_STATUS', socketHandler)

        return () => {
            socket.off('USER_STATUS', socketHandler)
        }
    }, [mutate, user])

    useEffect(() => {
        const remove = listenEvent('FRIEND:CHANGE-FRIEND-STATUS', (detail) => {
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
        })

        return remove
    }, [mutate, user])

    const Loading = () => {
        return (
            <div className="w-1100px mx-auto max-w-[1100px]">
                <Skeleton className="aspect-12/5 h-auto w-[1100px] rounded-lg object-cover" />
                <div className="relative w-full px-6 py-4 sm:flex sm:items-center">
                    <Skeleton
                        circle
                        width={130}
                        height={130}
                        className="absolute top-[-100px] w-[130px] border-4 border-white sm:top-[-30px] dark:border-[#242526]"
                    />
                    <div className="top-[50px] flex-1">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton key={index} height={24} width={200} />
                        ))}
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
            <header className="dark:bg-dark bg-white [box-shadow:1px_2px_4px_rgba(0,0,0,0.1)]">
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
                            className="aspect-12/5 h-auto w-[1100px] rounded-lg object-cover"
                            style={{ width: '100%', height: 'auto' }}
                        />
                        {user && currentUser && (
                            <User currentUser={currentUser} user={user} handleAfterAcceptFriend={() => mutate()} />
                        )}
                        <div className="mt-0 w-full border-t border-gray-300 px-4 sm:mt-10 dark:border-zinc-700">
                            <NavLink
                                href={`${config.routes.user}/@${user?.data.nickname}`}
                                className={(nav) => {
                                    return cn(
                                        'text-muted-foreground inline-block rounded-lg border-b-2 border-transparent px-5 py-4 font-medium hover:bg-gray-100 dark:hover:bg-zinc-800',
                                        {
                                            'text-primary border-primary rounded-br-none rounded-bl-none': nav.isActive,
                                        },
                                    )
                                }}
                            >
                                <button className="">Tất cả</button>
                            </NavLink>
                            <NavLink
                                href={`${config.routes.user_friends.replace(':nickname', user?.data.nickname)}`}
                                className={(nav) => {
                                    return cn(
                                        'text-muted-foreground inline-block rounded-lg border-b-2 border-transparent px-5 py-4 font-medium hover:bg-gray-100 dark:hover:bg-zinc-800',
                                        {
                                            'text-primary border-primary rounded-br-none rounded-bl-none': nav.isActive,
                                        },
                                    )
                                }}
                            >
                                <button className="">Bạn bè</button>
                            </NavLink>
                        </div>
                    </div>
                ) : !user && !isLoading ? (
                    <NotFound />
                ) : (
                    <Loading />
                )}
            </header>
            <div className="w-1100px mx-auto max-w-[1100px]">{children}</div>
        </div>
    )
}
