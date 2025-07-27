import { memo, useCallback } from 'react'
import { useParams } from 'next/navigation'

import ConfirmModel from '~/components/ConfirmModal'
import handleApiError from '~/helpers/handleApiError'
import * as conversationService from '~/services/conversationService'

const BlockConversation = ({ member, handleCloseModal }: { member: any; handleCloseModal: () => void }) => {
    const { uuid } = useParams()

    const handleBlockConversation = useCallback(async () => {
        try {
            await conversationService.blockConversation({ uuid: uuid as string })
            handleCloseModal()
        } catch (error: any) {
            handleApiError(error)
        }
    }, [handleCloseModal, uuid])

    return (
        <ConfirmModel
            title={`Chặn ${member?.user.full_name}`}
            description="Bạn sẽ không nhận được tin nhắn hay cuộc gọi của họ trên HuanCanhCut."
            onConfirm={handleBlockConversation}
            isOpen={true}
            closeModal={handleCloseModal}
            confirmText="Chặn"
        />
    )
}

export default memo(BlockConversation)
