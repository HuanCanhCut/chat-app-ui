'use client'

import React, { useEffect, useState } from 'react'
import ReactModal from 'react-modal'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

import EditProfile from './EditProfile'
import { faUserPen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import AccountPreview from '~/components/AccountPreview'
import Button from '~/components/Button/Button'
import CustomTippy from '~/components/CustomTippy/CustomTippy'
import FriendButton from '~/components/FriendButton'
import { MessageIcon } from '~/components/Icons/Icons'
import UserAvatar from '~/components/UserAvatar/UserAvatar'
import config from '~/config'
import SWRKey from '~/enum/SWRKey'
import { listenEvent } from '~/helpers/events'
import * as conversationService from '~/services/conversationService'
import * as friendService from '~/services/friendService'
import { FriendsResponse, FriendsShip, UserModel, UserResponse } from '~/type/type'

interface UserProps {
    currentUser: UserResponse
    user: UserResponse
    handleAfterAcceptFriend?: () => void
}

export default function User({ currentUser, user, handleAfterAcceptFriend }: UserProps) {
    const router = useRouter()

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
        const remove = listenEvent('FRIEND:GET-NEW-FRIENDS', ({ userId }) => {
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
        return <AccountPreview user={user} currentUser={currentUser?.data} />
    }

    const handleSendMessage = async () => {
        // check if no conversation with user, then create temp conversation
        if (!user.data?.conversation?.uuid) {
            const conversation = await conversationService.createTempConversation({ userId: user.data.id })

            router.push(`/message/${conversation.data.uuid}`)
        } else {
            router.push(`/message/${user.data?.conversation?.uuid}`)
        }
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
            <div className="dark:border-dark absolute top-[-100px] w-[130px] rounded-full border-4 border-white sm:top-[-30px] sm:w-[168px]">
                <UserAvatar
                    src={currentUser?.data.id === user.data.id ? currentUser?.data.avatar : user.data.avatar}
                    size={168}
                    isOnline={user.data.is_online}
                    onlineClassName="w-7 h-7 right-1 sm:right-2 sm:bottom-2 border-4"
                />
            </div>
            <div className="mt-4 flex flex-col gap-2 overflow-hidden pr-4 sm:mt-0 sm:ml-[180px] sm:flex-1">
                <h1 className="m-0 mt-2 line-clamp-2 overflow-hidden leading-tight font-bold text-ellipsis">
                    {currentUser?.data.id === user.data.id ? currentUser?.data.full_name : user.data.full_name || 'ㅤ'}
                </h1>
                <p className="text-gr ay-700 text-base dark:text-gray-400">{user?.data.friends_count} người bạn</p>
                <div className="hidden sm:flex">
                    {friends?.data?.slice(0, 7).map((friend: FriendsShip, index) => {
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
                                    <Link href={`${config.routes.user}/@${friend.user.nickname}`}>
                                        <UserAvatar
                                            src={friend.user.avatar}
                                            size={36}
                                            key={index}
                                            className="dark:border-dark border-2 border-white"
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
                {currentUser?.data.id === user.data.id ? (
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
                        <FriendButton user={user.data} handleAfterAcceptFriend={handleAfterAcceptFriend} />

                        <Button buttonType="rounded" leftIcon={<MessageIcon />} onClick={handleSendMessage}>
                            Nhắn tin
                        </Button>
                    </>
                )}
            </div>
        </header>
    )
}
