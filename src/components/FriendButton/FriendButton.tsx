'use client'

import { useCallback, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserFriends, faUserPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import ReactModal from 'react-modal'

import * as friendService from '~/services/friendService'
import PopperWrapper from '~/components/PopperWrapper/PopperWrapper'
import { UserModel } from '~/type/type'
import Button from '~/components/Button/Button'
import { handleAcceptFriend, handleRejectFriendRequest } from '~/utils/friendEvent'
import { sendEvent } from '~/helpers/events'
import handleApiError from '~/helpers/handleApiError'

interface FriendButtonProps {
    user: UserModel
    className?: string
}

const FriendButton = ({ user, className = '' }: FriendButtonProps) => {
    const [modalIsOpen, setModalIsOpen] = useState(false)

    const handleAddFriend = useCallback(async () => {
        try {
            sendEvent({
                eventName: 'friend:change-friend-status',
                detail: { sent_friend_request: true },
            })

            return await friendService.addFriend(user.id)
        } catch (error: any) {
            handleApiError(error)
        }
    }, [user])

    const handleCancelFriendRequest = useCallback(async () => {
        try {
            sendEvent({
                eventName: 'friend:change-friend-status',
                detail: { sent_friend_request: false },
            })
            return await friendService.cancelFriendRequest(user.id)
        } catch (error: any) {
            handleApiError(error)
        }
    }, [user.id])

    const handleToggleFriend = useCallback(() => {
        if (user.is_friend) {
            setModalIsOpen(true)
        } else {
            handleAddFriend()
        }
    }, [setModalIsOpen, user.is_friend, handleAddFriend])

    const closeModal = useCallback(() => {
        setModalIsOpen(false)
    }, [])

    const handleUnfriend = useCallback(async () => {
        try {
            await friendService.unfriend(user.id)

            sendEvent({ eventName: 'friend:get-new-friends', detail: user.id })
            sendEvent({
                eventName: 'friend:change-friend-status',
                detail: { is_friend: false, friend_request: false },
            })
            closeModal()
        } catch (error: any) {
            handleApiError(error)
        }
    }, [closeModal, user.id])

    return (
        <>
            <ReactModal
                isOpen={modalIsOpen}
                ariaHideApp={false}
                overlayClassName="overlay"
                closeTimeoutMS={200}
                onRequestClose={() => setModalIsOpen(false)}
                className="modal"
            >
                <PopperWrapper className="w-[600px] px-0 pb-4">
                    <>
                        <header className="relative border-b border-gray-300 py-4 text-center dark:border-gray-700">
                            <h2>Hủy kết bạn với {user.full_name}</h2>
                            <Button
                                buttonType="icon"
                                onClick={closeModal}
                                className="absolute right-[10px] top-1/2 -translate-y-1/2"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </Button>
                        </header>
                        <main className="px-4">
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                Bạn có chắc chắn muốn hủy kết bạn với {user.full_name} không?
                            </p>
                            <div className="mt-8 flex justify-end gap-2">
                                <Button
                                    buttonType="outline"
                                    className="border-none px-4 py-1 text-primary"
                                    onClick={closeModal}
                                >
                                    Hủy
                                </Button>
                                <Button buttonType="primary" className="px-6 py-1" onClick={handleUnfriend}>
                                    Xác nhận
                                </Button>
                            </div>
                        </main>
                    </>
                </PopperWrapper>
            </ReactModal>
            {user.sent_friend_request && !user.friend_request ? (
                <Button
                    buttonType="rounded"
                    leftIcon={<FontAwesomeIcon icon={faUserPlus} />}
                    onClick={handleCancelFriendRequest}
                >
                    Hủy yêu cầu
                </Button>
            ) : user.friend_request ? (
                <>
                    <Button
                        buttonType="primary"
                        onClick={() => {
                            handleAcceptFriend(user.id)
                        }}
                    >
                        Chấp nhận
                    </Button>
                    <Button buttonType="rounded" onClick={() => handleRejectFriendRequest(user.id)}>
                        Hủy
                    </Button>
                </>
            ) : (
                <Button
                    buttonType={user.is_friend ? 'rounded' : 'primary'}
                    leftIcon={
                        user.is_friend ? (
                            <FontAwesomeIcon icon={faUserFriends} />
                        ) : (
                            <FontAwesomeIcon icon={faUserPlus} />
                        )
                    }
                    className={className}
                    onClick={handleToggleFriend}
                >
                    {user.is_friend ? 'Bạn bè' : 'Thêm bạn bè'}
                </Button>
            )}
        </>
    )
}

export default FriendButton
