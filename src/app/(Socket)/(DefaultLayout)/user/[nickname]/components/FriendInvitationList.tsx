import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'

import Button from '~/components/Button'
import UserAvatar from '~/components/UserAvatar'
import config from '~/config'
import SWRKey from '~/enum/SWRKey'
import handleApiError from '~/helpers/handleApiError'
import * as friendService from '~/services/friendService'
import { FriendInvitationResponse, FriendsShip } from '~/type/type'

const PER_PAGE = 15

const FriendInvitationList = () => {
    const [page, setPage] = useState(1)

    const { data: friendInvitation, mutate: mutateFriendInvitation } = useSWR<FriendInvitationResponse>(
        [SWRKey.GET_FRIEND_INVITATION],
        () => {
            return friendService.getFriendInvitation({ page, per_page: PER_PAGE })
        },
        {
            revalidateOnMount: true,
        },
    )

    useEffect(() => {
        let isLoading = false // Track if a page increment is in progress

        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight && !isLoading) {
                isLoading = true // Set loading to true to prevent further increments
                if (!friendInvitation) {
                    return
                }

                setPage((prevPage) => {
                    return prevPage >= friendInvitation.meta.pagination.total_pages ? prevPage : prevPage + 1
                })

                setTimeout(() => {
                    isLoading = false // Reset loading after a short delay
                }, 500) // Adjust the delay as needed
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [friendInvitation])

    useEffect(() => {
        if (page <= 1) {
            return
        }

        const getMoreFriends = async () => {
            try {
                const res = await friendService.getFriendInvitation({ page, per_page: PER_PAGE })

                if (!friendInvitation?.data) {
                    return
                }

                if (res) {
                    const newData: FriendInvitationResponse = {
                        ...res,
                        data: [...friendInvitation.data, ...res.data],
                    }

                    mutateFriendInvitation(newData, {
                        revalidate: false,
                    })
                }
            } catch (error: any) {
                handleApiError(error)
            }
        }

        getMoreFriends()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page])

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
        <>
            {friendInvitation?.data?.map((invitation: FriendsShip, index: number) => {
                return (
                    <Link
                        href={`${config.routes.user}/@${invitation.user?.nickname}`}
                        key={index}
                        className="flex items-center gap-4 overflow-hidden rounded-md border border-zinc-200 px-2 py-4 dark:border-zinc-800"
                    >
                        <UserAvatar
                            src={invitation.user?.avatar}
                            className="xxs::min-w-[70px] w-[60px] rounded-full"
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
        </>
    )
}

export default FriendInvitationList
