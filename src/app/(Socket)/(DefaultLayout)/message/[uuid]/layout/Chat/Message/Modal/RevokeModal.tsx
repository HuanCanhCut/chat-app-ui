import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from 'react-redux'
import { useParams } from 'next/navigation'
import { mutate } from 'swr'

import * as messageServices from '~/services/messageService'
import Button from '~/components/Button'
import PopperWrapper from '~/components/PopperWrapper'
import { getCurrentUser } from '~/redux/selector'
import { MessageModel, MessageResponse } from '~/type/type'
import { toast } from '~/utils/toast'
import React, { useState } from 'react'
import SWRKey from '~/enum/SWRKey'
interface RevokeModalProps {
    message: MessageModel
    onClose: () => void
}

const RevokeModal = ({ message, onClose }: RevokeModalProps) => {
    const { data: currentUser } = useSelector(getCurrentUser)

    const { uuid } = useParams()

    const revokeType =
        message.sender_id !== currentUser?.id ? 'for-me' : message.content === null ? 'for-me' : 'for-other'

    const [revokeChooseType, setRevokeChooseType] = useState<'for-me' | 'for-other'>(revokeType)

    const handleRevoke = async () => {
        try {
            const response = await messageServices.revokeMessage({
                conversationUuid: uuid as string,
                messageId: message.id,
                type: revokeChooseType,
            })

            if (response.status === 200) {
                switch (revokeChooseType) {
                    case 'for-me':
                        mutate(
                            [SWRKey.GET_MESSAGES, uuid],
                            (prev: MessageResponse | undefined) => {
                                if (!prev) return prev

                                const newMessages: MessageModel[] = []

                                for (const messageItem of prev.data) {
                                    if (messageItem.id !== message.id) {
                                        if (messageItem.parent?.id === message.id) {
                                            messageItem.parent = null
                                        }

                                        newMessages.push(messageItem)
                                    }
                                }

                                return {
                                    data: newMessages,
                                    meta: prev.meta,
                                }
                            },
                            {
                                revalidate: false,
                            },
                        )
                        break
                    case 'for-other':
                        break
                    default:
                        break
                }

                onClose()
            }
        } catch (error) {
            toast('Gỡ tin nhắn thất bại, vui lòng thử lại.', 'error')
        }
    }

    return (
        <PopperWrapper
            className={`!max-w-[calc(100vw-30px)] !border-none !p-0 ${revokeType === 'for-me' ? '!w-[550px]' : '!w-[700px]'}`}
        >
            <header className="relative border-b border-gray-200 p-3 text-center dark:border-zinc-700">
                <span className="text-center text-xl font-medium">
                    {revokeType === 'for-me' ? 'Gỡ đối với bạn?' : 'Bạn muốn tin nhắn này thu hồi ở phía ai?'}
                </span>

                <Button
                    buttonType="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-2xl"
                    onClick={onClose}
                >
                    <FontAwesomeIcon icon={faXmark} />
                </Button>
            </header>
            <main className="px-5 py-3">
                {revokeType === 'for-me' ? (
                    <>
                        <p className="text-[15px] font-light">
                            Tin nhắn này sẽ bị gỡ khỏi thiết bị của bạn, nhưng vẫn hiển thị với các thành viên khác
                            trong đoạn chat.
                        </p>
                    </>
                ) : (
                    <React.Fragment>
                        <div>
                            <div className="flex items-center gap-2 py-1">
                                <input
                                    className="h-6 w-6 rounded-full"
                                    type="radio"
                                    name="revoke-other"
                                    id="revoke-other"
                                    checked={revokeChooseType === 'for-other'}
                                    onChange={() => setRevokeChooseType('for-other')}
                                />
                                <label htmlFor="revoke-other" className="cursor-pointer font-medium">
                                    Thu hồi với mọi người
                                </label>
                            </div>
                            <p className="mx-8 mb-6 text-sm font-light text-zinc-600 dark:text-zinc-400">
                                Tin nhắn này sẽ bị thu hồi với mọi người trong đoạn chat. Những người khác có thể đã xem
                                hoặc chuyển tiếp tin nhắn đó. Tin nhắn đã thu hồi vẫn có thể bị báo cáo.
                            </p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 py-1">
                                <input
                                    className="h-6 w-6 rounded-full border"
                                    type="radio"
                                    name="revoke-other"
                                    id="revoke-forme"
                                    checked={revokeChooseType === 'for-me'}
                                    onChange={() => setRevokeChooseType('for-me')}
                                />
                                <label htmlFor="revoke-forme" className="cursor-pointer font-medium">
                                    Thu hồi với bạn
                                </label>
                            </div>
                            <p className="mx-8 mb-6 text-sm font-light text-zinc-600 dark:text-zinc-400">
                                Chúng tôi sẽ gỡ tin nhắn này ở phía bạn. Những người khác trong đoạn chat vẫn có thể xem
                                được.
                            </p>
                        </div>
                    </React.Fragment>
                )}

                <div className="mt-2 flex items-center justify-end gap-2">
                    <Button buttonType="rounded" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button buttonType="primary" onClick={handleRevoke}>
                        Gỡ
                    </Button>
                </div>
            </main>
        </PopperWrapper>
    )
}

export default RevokeModal
