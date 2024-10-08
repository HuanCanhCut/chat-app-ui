import { AxiosResponse } from 'axios'
import UserAvatar from '~/components/UserAvatar'
import { FriendsResponse, FriendsShip } from '~/type/type'

interface FriendListProps {
    friends: AxiosResponse<FriendsResponse>
}

const FriendList = ({ friends }: FriendListProps) => {
    return (
        <div className="mx-auto mt-4 max-w-[1100px] rounded-md bg-gray-100 p-4 dark:bg-darkGray">
            <h2>Bạn bè</h2>
            <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {friends.data.data.map((friend: FriendsShip, index: number) => {
                    return (
                        <div
                            key={index}
                            className="flex items-center rounded-md border border-gray-200 p-2 dark:border-gray-800"
                        >
                            <UserAvatar src={friend.user.avatar} className="rounded-lg" size={70} />
                            <div>
                                <h3 className="ml-4">{friend.user.full_name}</h3>
                                <p className="ml-4 text-sm text-gray-400 dark:text-gray-500">
                                    {friend.user.friends_count} nguời bạn
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default FriendList
