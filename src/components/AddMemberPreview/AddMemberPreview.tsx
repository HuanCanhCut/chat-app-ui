import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import useSWR from 'swr'

import { faCircle } from '@fortawesome/free-regular-svg-icons'
import { faCircleCheck, faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import AccountItem from '~/components/AccountItem/AccountItem'
import SearchFriend from '~/components/SearchFriend/SearchFriend'
import UserAvatar from '~/components/UserAvatar/UserAvatar'
import SWRKey from '~/enum/SWRKey'
import { sendEvent } from '~/helpers/events'
import handleApiError from '~/helpers/handleApiError'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import * as friendService from '~/services/friendService'
import { FriendsResponse, FriendsShip, UserModel } from '~/type/type'

const PER_PAGE = 20

interface AddMemberPreviewProps {
    className?: string
}

interface ImperativeHandle {
    GET_PREVIEW_MEMBER: () => UserModel[]
}

const AddMemberPreview = forwardRef<ImperativeHandle, AddMemberPreviewProps>(({ className = '' }, ref) => {
    const currentUser = useAppSelector(getCurrentUser)

    const [searchResult, setSearchResult] = useState<FriendsShip[]>([])
    const [previewMember, setPreviewMember] = useState<UserModel[]>([])

    const { data: friends, mutate: mutateFriends } = useSWR<FriendsResponse | undefined>(
        [SWRKey.GET_ALL_FRIENDS, currentUser?.data.id],
        () => {
            return friendService.getFriends({ page: 1, user_id: currentUser?.data.id })
        },
    )

    useImperativeHandle<ImperativeHandle, ImperativeHandle>(ref, () => ({
        GET_PREVIEW_MEMBER: () => {
            return previewMember
        },
    }))

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
        } catch (error: any) {
            handleApiError(error)
        }
    }, [currentUser?.data.id, friends, mutateFriends])

    const handleToggleAddPreview = (friend: UserModel) => {
        const isAdded = previewMember.find((user) => user.id === friend.id)

        if (!isAdded) {
            setPreviewMember((prev) => [...prev, friend])
        } else {
            setPreviewMember((prev) => prev.filter((user) => user.id !== friend.id))
        }
    }

    useEffect(() => {
        sendEvent('ADD_MEMBER:PREVIEW', { previewMember })
    }, [previewMember])

    const handleRemovePreview = (user: UserModel) => {
        setPreviewMember((prev) => {
            return prev.filter((userPreview) => userPreview.id !== user.id)
        })
    }

    return (
        <main className={`flex w-[550px] max-w-full flex-1 flex-col overflow-hidden ${className}`}>
            <div className="flex flex-1 flex-col overflow-hidden p-4">
                <SearchFriend placeholder="Tìm kiếm" setSearchResult={setSearchResult} />

                <div className="p-4">
                    {previewMember.length > 0 ? (
                        <div className="flex gap-4 [overflow-x:overlay] py-1">
                            {previewMember.map((user) => {
                                return (
                                    <div key={user.id} className="relative">
                                        <button
                                            onClick={() => handleRemovePreview(user)}
                                            className="flex-center dark:bg-dark-gray absolute top-0 right-0 z-10 h-5 w-5 translate-x-2 -translate-y-1 rounded-full bg-white p-1 shadow-lg shadow-gray-400 hover:bg-zinc-100 dark:shadow-md dark:shadow-zinc-800 dark:hover:bg-zinc-700"
                                        >
                                            <FontAwesomeIcon
                                                icon={faXmark}
                                                className="text-system-message-light dark:text-system-message-dark"
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
                            <p className="text-system-message-light dark:text-system-message-dark text-sm">
                                Chưa chọn người dùng nào
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex-1 [overflow-y:overlay]">
                    <InfiniteScroll
                        dataLength={searchResult.length || friends?.data.length || 0}
                        next={handleLoadMoreFriend}
                        className="overflow-hidden!"
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
                        {(searchResult && searchResult.length > 0 ? searchResult : friends?.data || []).map(
                            (friend) => {
                                return (
                                    <div
                                        key={friend.id}
                                        className="relative"
                                        onClick={() => handleToggleAddPreview(friend.user)}
                                    >
                                        <AccountItem user={friend.user} avatarSize={35} />

                                        {previewMember.some((user) => user.id === friend.user.id) ? (
                                            <FontAwesomeIcon
                                                icon={faCircleCheck}
                                                className="text-primary absolute top-1/2 right-3 -translate-y-1/2"
                                            />
                                        ) : (
                                            <FontAwesomeIcon
                                                icon={faCircle}
                                                className="absolute top-1/2 right-3 -translate-y-1/2"
                                            />
                                        )}
                                    </div>
                                )
                            },
                        )}
                    </InfiniteScroll>
                </div>
            </div>
        </main>
    )
})

AddMemberPreview.displayName = 'AddMemberPreview'

export default AddMemberPreview
