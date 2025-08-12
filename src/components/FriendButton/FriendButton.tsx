'use client'

import { useCallback, useState } from 'react'

import ConfirmModal from '../ConfirmModal/ConfirmModal'
import { faUserFriends, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from '~/components/Button/Button'
import { sendEvent } from '~/helpers/events'
import handleApiError from '~/helpers/handleApiError'
import * as friendService from '~/services/friendService'
import { UserModel } from '~/type/type'
import { handleAcceptFriend, handleRejectFriendRequest } from '~/utils/friendEvent'

interface FriendButtonProps {
    user: UserModel
    className?: string
    handleAfterAcceptFriend?: () => void
}

const FriendButton = ({ user, className = '', handleAfterAcceptFriend }: FriendButtonProps) => {
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
            <ConfirmModal
                title={`Hủy kết bạn với ${user.full_name}`}
                description={`Bạn có chắc chắn muốn hủy kết bạn với ${user.full_name} không?`}
                onConfirm={handleUnfriend}
                isOpen={modalIsOpen}
                closeModal={closeModal}
                confirmText="Hủy kết bạn"
            />
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
                            handleAcceptFriend(user.id, user.nickname)

                            if (handleAfterAcceptFriend) {
                                handleAfterAcceptFriend()
                            }
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
