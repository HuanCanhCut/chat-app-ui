'use client'

import useSWR from 'swr'
import SWRKey from '~/enum/SWRKey'
import getCurrentUser from '~/zustand/getCurrentUser'
import * as friendServices from '~/services/friendService'
import AccountItem from './AccountItem'

const Friends = () => {
    const { currentUser } = getCurrentUser()

    const { data: friends } = useSWR(currentUser ? [SWRKey.GET_ALL_FRIENDS, currentUser?.data?.id] : null, () => {
        if (currentUser) {
            return friendServices.getFriends({ user_id: currentUser?.data?.id, per_page: 15 })
        }
    })

    return (
        <div className="mt-4 w-full">
            {friends?.data?.map((friend) => <AccountItem className="w-full" key={friend?.id} user={friend.user} />)}
        </div>
    )
}

export default Friends
