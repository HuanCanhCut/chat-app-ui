'use client'

import { faUserPen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ReactModal from 'react-modal'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import useSWR from 'swr'

import * as friendService from '~/services/friendService'
import Button from '~/components/Button/Button'
import { MessageIcon } from '~/components/Icons/Icons'
import UserAvatar from '~/components/UserAvatar/UserAvatar'
import { FriendsResponse, FriendsShip, UserModel, UserResponse } from '~/type/type'
import EditProfile from './EditProfile'
import CustomTippy from '~/components/CustomTippy/CustomTippy'
import AccountPreview from '~/components/AccountPreview'
import { listenEvent } from '~/helpers/events'
import FriendButton from '~/components/FriendButton'
import SWRKey from '~/enum/SWRKey'

interface UserProps {
    currentUser: UserResponse
    user: UserResponse
}

export default function User({ currentUser, user }: UserProps) {
    const [isOpen, setIsOpen] = useState(false)

    // get friends of user
    const { data: friends, mutate: mutateFriends } = useSWR<FriendsResponse | undefined>(
        user.data.nickname ? [SWRKey.GET_ALL_FRIENDS, user.data.nickname] : null,
        () => {
            return friendService.getFriends({ page: 1, user_id: user.data.id })
        },
        {
            revalidateOnMount: true,
        },
    )

    useEffect(() => {
        // Remove friend from friends list when unfriend
        const remove = listenEvent({
            eventName: 'friend:get-new-friends',
            handler: ({ detail: userId }) => {
                if (!friends) {
                    return
                }

                const newFriends: FriendsResponse = {
                    ...friends,
                    data: friends?.data.filter((friend) => friend.user.id !== userId),
                }

                mutateFriends(newFriends, {
                    revalidate: false,
                })
            },
        })

        return remove
    }, [friends, mutateFriends])

    const openModal = () => {
        setIsOpen(true)
    }

    const closeModal = () => {
        setIsOpen(false)
    }

    const renderAccountPreview = (user: UserModel) => {
        return <AccountPreview user={user} currentUser={currentUser.data} />
    }

    return (
        <header className="relative w-full px-6 py-4 sm:flex sm:items-center">
            <ReactModal
                isOpen={isOpen}
                ariaHideApp={false}
                overlayClassName="overlay"
                closeTimeoutMS={200}
                onRequestClose={closeModal}
                className="modal"
            >
                <EditProfile closeModal={closeModal} />
            </ReactModal>
            <UserAvatar
                src={currentUser.data.id === user.data.id ? currentUser.data.avatar : user.data.avatar}
                size={168}
                className="absolute top-[-100px] w-[130px] border-4 border-white dark:border-[#242526] sm:top-[-30px] sm:w-[168px]"
            />
            <div className="mt-4 flex flex-col gap-2 sm:ml-[180px] sm:mt-0 sm:flex-1">
                <h1 className="m-0 mt-2 font-semibold">{user?.data.full_name || 'ㅤ'}</h1>
                <p className="text-base text-gray-700 dark:text-gray-400">{user?.data.friends_count} người bạn</p>
                <div className="hidden sm:flex">
                    {friends?.data?.map((friend: FriendsShip, index) => {
                        // 7 là số lượng bạn bè tối đa hiển thị
                        if (index >= 7) {
                            return
                        }

                        const translateValue = `translateX(-${index * 7}px)`

                        return (
                            <React.Fragment key={index}>
                                <CustomTippy
                                    renderItem={() => renderAccountPreview(friend.user)}
                                    trigger="mouseenter"
                                    timeDelayOpen={300}
                                    timeDelayClose={100}
                                    placement="top"
                                >
                                    <Link href={`/user/@${friend.user.nickname}`}>
                                        <UserAvatar
                                            src={friend.user.avatar}
                                            size={36}
                                            key={index}
                                            className="border-2 border-white dark:border-dark"
                                            style={{
                                                transform: translateValue,
                                            }}
                                        />
                                    </Link>
                                </CustomTippy>
                            </React.Fragment>
                        )
                    })}
                </div>
            </div>
            <div className="mt-4 flex gap-2 sm:mt-0">
                {currentUser.data.id === user.data.id ? (
                    <Button
                        buttonType="rounded"
                        className="flex-1"
                        leftIcon={<FontAwesomeIcon icon={faUserPen} />}
                        onClick={openModal}
                    >
                        Chỉnh sửa hồ sơ
                    </Button>
                ) : (
                    <>
                        <FriendButton user={user.data} />
                        {user.data.is_friend && (
                            <Button buttonType="primary" leftIcon={<MessageIcon />}>
                                Nhắn tin
                            </Button>
                        )}
                    </>
                )}
            </div>
        </header>
    )
}
