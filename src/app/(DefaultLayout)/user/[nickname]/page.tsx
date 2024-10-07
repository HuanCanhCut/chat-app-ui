'use client'

import { useEffect, useState } from 'react'
import { AxiosResponse } from 'axios'
import Image from 'next/image'
import useSWR, { mutate } from 'swr'

import config from '~/config'
import { FriendsResponse, UserResponse } from '~/type/type'
import * as friendsService from '~/services/friendsService'
import * as authService from '~/services/authService'
import * as userService from '~/services/userService'
import { useParams } from 'next/navigation'
import User from './components/User'

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

    if (friends?.status !== 200 || currentUser?.status !== 200 || user?.status !== 200) {
        return <div className="min-h-screen">Some thing went wrong, please try again later</div>
    }
    return (
        <div className="w-1100px mx-auto min-h-screen max-w-[1100px]">
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
            {friends && user && currentUser && <User friends={friends} currentUser={currentUser} user={user} />}
        </div>
    )
}
