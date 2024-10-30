'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserFriends, faUserPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import ReactModal from 'react-modal'

import * as friendService from '~/services/friendService'
import PopperWrapper from './PopperWrapper'
import { UserModel } from '~/type/type'
import Button from './Button'
import { useCallback, useState } from 'react'
import { showToast } from '~/project/services'
import { sendEvent } from '~/helpers/events'

interface FriendButtonProps {
    user: UserModel
    className?: string
}

const FriendButton = ({ user, className = '' }: FriendButtonProps) => {
    const [modalIsOpen, setModalIsOpen] = useState(false)

    const handleToggleFriend = (userId: number) => {
        setModalIsOpen(true)
    }

    const closeModal = useCallback(() => {
        setModalIsOpen(false)
    }, [])

    const handleUnfriend = async (userId: number, userName: string) => {
        try {
            const response = await friendService.unfriend(userId)

            switch (response.status) {
                case 200:
                    showToast({ message: `Bạn đã hủy kết bạn với ${userName}` })
                    sendEvent({ eventName: 'friend:unfriend', detail: userId })
                    closeModal()
                    break
                default:
                    showToast({ message: `Có lỗi xảy ra, vui lòng thử lại` })
                    closeModal()
                    break
            }
        } catch (error) {
            console.log(error)
        }
    }

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
                                <Button
                                    buttonType="primary"
                                    className="px-6 py-1"
                                    onClick={() => {
                                        handleUnfriend(user.id, user.full_name)
                                    }}
                                >
                                    Xác nhận
                                </Button>
                            </div>
                        </main>
                    </>
                </PopperWrapper>
            </ReactModal>
            <Button
                buttonType={user.is_friend ? 'rounded' : 'primary'}
                leftIcon={
                    user.is_friend ? <FontAwesomeIcon icon={faUserFriends} /> : <FontAwesomeIcon icon={faUserPlus} />
                }
                className={className}
                onClick={() => {
                    handleToggleFriend(user.id)
                }}
            >
                {user.is_friend ? 'Bạn bè' : 'Thêm bạn bè'}
            </Button>
        </>
    )
}

export default FriendButton
