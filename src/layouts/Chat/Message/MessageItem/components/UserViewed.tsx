import React from 'react'

import Tippy from '@tippyjs/react'
import UserAvatar from '~/components/UserAvatar'
import { MessageModel, MessageStatus, UserModel } from '~/type/type'

interface UserViewedProp {
    message: MessageModel
    currentUser: UserModel
    messageIndex: number
    // eslint-disable-next-line no-unused-vars
    handleFormatTime: (time: Date) => string
}

const UserViewed: React.FC<UserViewedProp> = ({ message, currentUser, messageIndex, handleFormatTime }) => {
    return (
        <div className={`flex justify-end pr-2`}>
            {message.message_status.slice(0, 6).map((status: MessageStatus, index: number) => {
                if (
                    status.receiver.last_read_message_id === message.id &&
                    status.receiver_id !== currentUser?.id &&
                    status.status === 'read'
                ) {
                    return (
                        <React.Fragment key={index}>
                            <Tippy
                                content={`${status.receiver.full_name} đã xem lúc ${handleFormatTime(status.read_at)}`}
                            >
                                <span>
                                    <UserAvatar
                                        src={status.receiver.avatar}
                                        size={14}
                                        className="my-1 ml-1 cursor-default"
                                    />
                                </span>
                            </Tippy>
                        </React.Fragment>
                    )
                }

                return null
            })}

            {messageIndex === 0 && message.sender_id === currentUser?.id && (
                <>
                    {(() => {
                        // find latest status of message that is not current user
                        const latestStatus = message.message_status.find(
                            (status) => status.receiver_id !== currentUser?.id,
                        )

                        // someone has read the message
                        const readStatus = message.message_status.some((status) => {
                            return status.receiver_id !== currentUser?.id && status.status === 'read'
                        })

                        if (latestStatus && !readStatus) {
                            const statusMessages = {
                                sent: 'Đã gửi',
                                delivered: 'Đã nhận',
                                sending: 'Đang gửi',
                            }

                            const statusText = statusMessages[latestStatus.status as keyof typeof statusMessages]

                            if (statusText) {
                                return <p className="mt-[2px] text-xs font-normal text-zinc-400">{statusText}</p>
                            }
                        }

                        return null
                    })()}
                </>
            )}
        </div>
    )
}

export default UserViewed
