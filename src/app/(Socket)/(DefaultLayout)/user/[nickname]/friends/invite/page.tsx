'use client'

import { useCallback } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import Link from 'next/link'
import { toast } from 'sonner'
import useSWR from 'swr'

import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from '~/components/Button'
import UserAvatar from '~/components/UserAvatar'
import config from '~/config'
import SWRKey from '~/enum/SWRKey'
import handleApiError from '~/helpers/handleApiError'
import * as friendService from '~/services/friendService'
import { FriendInvitationResponse, FriendsShip } from '~/type/type'

const PER_PAGE = 15

const InvitePage = () => {
    const { data: friendInvitation, mutate: mutateFriendInvitation } = useSWR<FriendInvitationResponse>(
        [SWRKey.GET_FRIEND_INVITATION],
        () => {
            return friendService.getFriendInvitation({ page: 1, per_page: PER_PAGE })
        },
        {
            revalidateOnMount: true,
        },
    )

    const handleMutateFriendInvitation = useCallback(
        (invitation: FriendsShip, status: 'accepted' | 'rejected') => {
            mutateFriendInvitation(
                (prev?: FriendInvitationResponse) => {
                    if (!prev) {
                        return prev
                    }

                    return {
                        ...prev,
                        data: prev.data.map((invitationItem) => {
                            if (invitationItem.id === invitation.id) {
                                return {
                                    ...invitationItem,
                                    status,
                                }
                            }

                            return invitationItem
                        }),
                    }
                },
                {
                    revalidate: false,
                },
            )
        },
        [mutateFriendInvitation],
    )

    const handleReject = useCallback(
        async (invitation: FriendsShip) => {
            try {
                await friendService.rejectFriend(invitation.user_id)

                handleMutateFriendInvitation(invitation, 'rejected')
            } catch (error) {
                handleApiError(error)
            }
        },
        [handleMutateFriendInvitation],
    )

    const handleAccept = useCallback(
        async (invitation: FriendsShip) => {
            try {
                await friendService.acceptFriend(invitation.user_id)

                handleMutateFriendInvitation(invitation, 'accepted')
            } catch (error) {
                handleApiError(error)
            }
        },
        [handleMutateFriendInvitation],
    )

    return (
        <InfiniteScroll
            dataLength={friendInvitation?.data.length || 0}
            next={async () => {
                try {
                    if (!friendInvitation?.data) {
                        return
                    }

                    const res = await friendService.getFriendInvitation({
                        page: (friendInvitation?.meta.pagination.current_page ?? 0) + 1,
                        per_page: PER_PAGE,
                    })

                    if (!res) {
                        return
                    }

                    const newData = {
                        ...friendInvitation,
                        data: [...friendInvitation.data, ...res.data],
                        meta: {
                            ...friendInvitation.meta,
                            pagination: {
                                ...res.meta.pagination,
                            },
                        },
                    }

                    mutateFriendInvitation(newData, false)
                } catch (error) {
                    toast.error('Lỗi khi tải thêm bạn')
                }
            }}
            className="mt-4 grid grid-cols-1 gap-3 overflow-hidden! md:grid-cols-2"
            hasMore={
                (friendInvitation?.meta.pagination.current_page ?? 0) <
                (friendInvitation?.meta.pagination.total_pages ?? 0)
            }
            scrollThreshold={0.8}
            loader={
                <div className="flex justify-center">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                </div>
            }
        >
            {friendInvitation?.data?.map((invitation: FriendsShip, index: number) => {
                return (
                    <Link
                        href={`${config.routes.user}/@${invitation.user?.nickname}`}
                        key={index}
                        className="flex items-center gap-4 overflow-hidden rounded-md border border-zinc-200 px-2 py-4 dark:border-zinc-800"
                    >
                        <UserAvatar
                            src={invitation.user?.avatar}
                            className="xxs::min-w-[70px] w-15 rounded-full"
                            size={70}
                        />

                        <div className="flex-1 items-center justify-between overflow-hidden lg:flex">
                            <div className="overflow-hidden">
                                <h4 className="truncate pr-2">{invitation.user?.full_name}</h4>
                                <p className="ml-4 text-xs text-gray-600 dark:text-gray-400">
                                    {invitation.user?.mutual_friends_count && invitation.user?.mutual_friends_count > 0
                                        ? `${invitation.user?.mutual_friends_count} bạn chung`
                                        : ''}
                                </p>
                            </div>

                            <div className="mt-2 flex items-center lg:mt-0">
                                {invitation.status === 'pending' ? (
                                    <>
                                        <Button
                                            buttonType="rounded"
                                            className="mr-2 w-full whitespace-nowrap lg:w-auto"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                handleReject(invitation)
                                            }}
                                        >
                                            Từ chối
                                        </Button>
                                        <Button
                                            buttonType="primary"
                                            className="w-full whitespace-nowrap lg:w-auto"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                handleAccept(invitation)
                                            }}
                                        >
                                            Chấp nhận
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        buttonType="rounded"
                                        className="w-full cursor-default whitespace-nowrap"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                    >
                                        {invitation.status === 'accepted'
                                            ? 'Đã chấp nhận lời mời'
                                            : 'Đã từ chối lời mời'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Link>
                )
            })}
        </InfiniteScroll>
    )
}

export default InvitePage
