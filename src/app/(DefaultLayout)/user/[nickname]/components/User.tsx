'use client'

import { faUserPen, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ReactModal from 'react-modal'
import { AxiosResponse } from 'axios'
import Link from 'next/link'
import React, { useState } from 'react'
import Button from '~/components/Button'
import { MessageIcon } from '~/components/Icons'
import UserAvatar from '~/components/UserAvatar'
import { FriendsResponse, FriendsShip, UserResponse } from '~/type/type'
import EditProfile from './EditProfile'

interface UserProps {
    friends: AxiosResponse<FriendsResponse>
    currentUser: AxiosResponse<UserResponse>
    user: AxiosResponse<UserResponse>
}

export default function User({ friends, currentUser, user }: UserProps) {
    const [isOpen, setIsOpen] = useState(false)

    const openModal = () => {
        setIsOpen(true)
    }

    const closeModal = () => {
        setIsOpen(false)
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
                src={
                    currentUser.data.data.id === user.data.data.id
                        ? currentUser.data.data.avatar
                        : user.data.data.avatar
                }
                size={168}
                className="absolute top-[-100px] w-[130px] border-4 border-white dark:border-[#242526] sm:top-[-30px] sm:w-[168px]"
            />
            <div className="mt-4 sm:ml-[180px] sm:mt-0 sm:flex-1">
                <h1 className="font-semibold">{user?.data.data.full_name}</h1>
                <p className="mt-1 text-base text-gray-700 dark:text-gray-300">
                    {user?.data.data.friends_count} người bạn
                </p>
                <div className="mt-2 hidden sm:flex">
                    {friends.data.data.map((friend: FriendsShip, index) => {
                        // 7 là số lượng bạn bè tối đa hiển thị
                        if (index >= 7) {
                            return
                        }

                        const translateValue = `translateX(-${index * 7}px)`
                        return (
                            <React.Fragment key={index}>
                                <Link href={`/user/@${friend.user.nickname}`}>
                                    <UserAvatar
                                        src={friend.user.avatar}
                                        size={32}
                                        key={index}
                                        className={`border border-white dark:border-dark`}
                                        style={{
                                            transform: translateValue,
                                            zIndex: friends.data.data.length - index,
                                        }}
                                    />
                                </Link>
                            </React.Fragment>
                        )
                    })}
                </div>
            </div>
            <div className="mt-4 flex gap-2 sm:mt-0">
                {currentUser.data.data.id === user.data.data.id ? (
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
                        <Button buttonType="rounded" leftIcon={<FontAwesomeIcon icon={faUserPlus} />}>
                            Thêm bạn bè
                        </Button>
                        <Button buttonType="primary" leftIcon={<MessageIcon />}>
                            Nhắn tin
                        </Button>
                    </>
                )}
            </div>
        </header>
    )
}
