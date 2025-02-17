import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from 'react-redux'
import { useParams } from 'next/navigation'

import * as messageServices from '~/services/messageService'
import Button from '~/components/Button'
import PopperWrapper from '~/components/PopperWrapper'
import { getCurrentUser } from '~/redux/selector'
import { MessageModel } from '~/type/type'
import { toast } from '~/utils/toast'
import { sendEvent } from '~/helpers/events'
interface RevokeModalProps {
    message: MessageModel
    onClose: () => void
}

const RevokeModal = ({ message, onClose }: RevokeModalProps) => {
    const { data: currentUser } = useSelector(getCurrentUser)

    const { uuid } = useParams()

    const revokeType = message.sender_id !== currentUser?.id ? 'for-me' : message.content === null ? 'for-me' : 'for-other'

    const handleRevoke = async () => {
        try {
            const response = await messageServices.revokeMessage({
                conversationUuid: uuid as string,
                messageId: message.id,
                type: revokeType,
            })

            if (response.status === 200) {
                sendEvent({ eventName: 'message:revoke', detail: { messageId: message.id, type: revokeType } })
                onClose()
            }
        } catch (error) {
            toast('Gỡ tin nhắn thất bại, vui lòng thử lại.', 'error')
        }
    }

    return (
        <PopperWrapper className={`!max-w-[calc(100vw-30px)] !border-none !p-0 ${revokeType === 'for-me' ? '!w-[550px]' : '!w-[700px]'}`}>
            <header className="relative border-b border-gray-200 p-3 text-center dark:border-zinc-700">
                <span className="text-center text-xl font-medium">
                    {revokeType === 'for-me' ? 'Gỡ đối với bạn?' : 'Bạn muốn tin nhắn này thu hồi ở phía ai?'}
                </span>

                <Button buttonType="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-2xl" onClick={onClose}>
                    <FontAwesomeIcon icon={faXmark} />
                </Button>
            </header>
            <main className="p-3">
                {revokeType === 'for-me' ? (
                    <>
                        <p className="text-[15px] font-light">
                            Tin nhắn này sẽ bị gỡ khỏi thiết bị của bạn, nhưng vẫn hiển thị với các thành viên khác trong đoạn chat.
                        </p>
                        <div className="mt-2 flex items-center justify-end gap-2">
                            <Button buttonType="rounded" onClick={onClose}>
                                Hủy
                            </Button>
                            <Button buttonType="primary" onClick={handleRevoke}>
                                Gỡ
                            </Button>
                        </div>
                    </>
                ) : (
                    <p>Khi bạn thu hồi tin nhắn này, nó sẽ không còn hiển thị trong cuộc trò chuyện của bạn.</p>
                )}
            </main>
        </PopperWrapper>
    )
}

export default RevokeModal
