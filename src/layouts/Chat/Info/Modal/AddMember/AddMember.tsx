import { useCallback, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { AxiosError } from 'axios'
import useSWR from 'swr'

import { faCircle } from '@fortawesome/free-regular-svg-icons'
import { faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import AccountItem from '~/components/AccountItem/AccountItem'
import Button from '~/components/Button'
import SearchFriend from '~/components/SearchFriend/SearchFriend'
import UserAvatar from '~/components/UserAvatar/UserAvatar'
import SWRKey from '~/enum/SWRKey'
import handleApiError from '~/helpers/handleApiError'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import * as friendService from '~/services/friendService'
import { FriendsResponse, UserModel } from '~/type/type'

const PER_PAGE = 20

const AddMember: React.FC = () => {
    const currentUser = useAppSelector(getCurrentUser)

    const [searchResult, setSearchResult] = useState<UserModel[]>([])
    const [addedMembers, setAddedMembers] = useState<UserModel[]>([])

    const { data: friends, mutate: mutateFriends } = useSWR<FriendsResponse | undefined>(
        [SWRKey.GET_ALL_FRIENDS, currentUser?.data.id],
        () => {
            return friendService.getFriends({ page: 1, user_id: currentUser?.data.id })
        },
    )

    const handleLoadMoreFriend = useCallback(async () => {
        try {
            const res = await friendService.getFriends({
                page: friends ? friends?.meta.pagination.current_page + 1 : 1,
                per_page: PER_PAGE,
                user_id: currentUser?.data.id,
            })

            if (!res) return

            mutateFriends((prev: FriendsResponse | undefined) => {
                if (!prev) return prev

                return {
                    data: [...prev.data, ...res.data],
                    meta: res.meta,
                }
            })
        } catch (error) {
            if (error instanceof AxiosError) {
                handleApiError(error)
            }
        }
    }, [currentUser?.data.id, friends, mutateFriends])

    const handleAddPreview = (friend: UserModel) => {
        const added = addedMembers.find((user) => user.id === friend.id)

        if (!added) {
            setAddedMembers((prev) => [...prev, friend])
        }
    }

    const handleRemovePreview = (user: UserModel) => {
        setAddedMembers((prev) => {
            return prev.filter((userPreview) => userPreview.id !== user.id)
        })
    }

    return (
        <main className="flex w-[550px] max-w-full flex-1 flex-col overflow-hidden">
            <div className="flex flex-1 flex-col overflow-hidden p-4">
                <SearchFriend placeholder="Tìm kiếm" setSearchResult={setSearchResult} />

                <div className="px-4 py-8">
                    {addedMembers.length > 0 ? (
                        <div className="flex gap-4 py-1 [overflow-x:overlay]">
                            {addedMembers.map((user) => {
                                return (
                                    <div key={user.id} className="relative">
                                        <button
                                            onClick={() => handleRemovePreview(user)}
                                            className="flex-center absolute right-0 top-0 z-10 h-5 w-5 -translate-y-1 translate-x-2 rounded-full bg-white p-1 shadow-lg shadow-gray-400 hover:bg-zinc-100 dark:bg-darkGray dark:shadow-md dark:shadow-zinc-800 dark:hover:bg-zinc-700"
                                        >
                                            <FontAwesomeIcon
                                                icon={faXmark}
                                                className="text-systemMessageLight dark:text-systemMessageDark"
                                                width={12}
                                                height={12}
                                            />
                                        </button>
                                        <UserAvatar src={user.avatar} alt={user.nickname} className="h-10 w-10" />
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-sm text-systemMessageLight dark:text-systemMessageDark">
                                Chưa chọn người dùng nào
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex-1 [overflow-y:overlay]">
                    <InfiniteScroll
                        dataLength={friends?.data.length || 0} //This is important field to render the next data
                        next={handleLoadMoreFriend}
                        className="!overflow-hidden"
                        hasMore={
                            friends
                                ? friends?.meta.pagination.current_page < friends?.meta.pagination.total_pages
                                : false
                        }
                        scrollThreshold={0.8}
                        loader={
                            <div className="flex justify-center">
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            </div>
                        }
                        scrollableTarget="theme-scrollable"
                    >
                        {(searchResult && searchResult.length > 0
                            ? searchResult
                            : friends?.data.map((friend) => friend.user) || []
                        ).map((friend) => {
                            return (
                                <div key={friend.id} className="relative" onClick={() => handleAddPreview(friend)}>
                                    <AccountItem user={friend} avatarSize={35} />

                                    <FontAwesomeIcon
                                        icon={faCircle}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    />
                                </div>
                            )
                        })}
                    </InfiniteScroll>
                </div>

                <Button buttonType="primary" disabled={addedMembers.length === 0} className="mt-4 w-full">
                    Thêm nguời
                </Button>
            </div>
        </main>
    )
}

export default AddMember
