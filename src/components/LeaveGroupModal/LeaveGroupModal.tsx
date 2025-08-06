import { useCallback } from 'react'
import { useParams } from 'next/navigation'

import ConfirmModel from '~/components/ConfirmModal'
import { sendEvent } from '~/helpers/events'
import handleApiError from '~/helpers/handleApiError'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import * as conversationService from '~/services/conversationService'
import { ConversationMember, ConversationModel } from '~/type/type'

interface LeaveGroupModalProps {
    onClose: () => void
    conversation?: ConversationModel
}

const LeaveGroupModal: React.FC<LeaveGroupModalProps> = ({ onClose, conversation }) => {
    const currentUser = useAppSelector(getCurrentUser)
    const { uuid } = useParams()

    const currentUserMember = conversation?.members.find((member) => {
        return member.user_id === currentUser?.data.id
    }) as ConversationMember | undefined

    const isAdmin = currentUserMember?.role === 'admin' || currentUserMember?.role === 'leader'

    const handleLeaveGroup = useCallback(async () => {
        try {
            await conversationService.leaveConversation({ uuid: uuid as string })

            sendEvent({
                eventName: 'conversation:leave-group',
                detail: {
                    conversation_uuid: uuid as string,
                },
            })

            onClose()
        } catch (error) {
            handleApiError(error)
        }
    }, [onClose, uuid])

    return (
        <ConfirmModel
            title={`${isAdmin ? 'Rời đi mà không chọn Quản trị viên?' : 'Rời nhóm'}`}
            description={`${
                isAdmin
                    ? 'Bạn có thể chọn quản trị viên mới trong số những người có tên ở phần Thành viên. Nếu bạn rời khỏi nhóm mà không chọn ai thay thế, thành viên kỳ cựu nhất của nhóm sẽ trở thành quản trị viên.'
                    : 'Bạn sẽ không nhận được tin nhắn hay cuộc gọi của họ trên HuanCanhCut.'
            }`}
            onConfirm={handleLeaveGroup}
            isOpen={true}
            closeModal={onClose}
            confirmText="Rời nhóm"
        />
    )
}

export default LeaveGroupModal
