import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

import Button from '~/components/Button'
import ConfirmModal from '~/components/ConfirmModal'
import SWRKey from '~/enum/SWRKey'
import handleApiError from '~/helpers/handleApiError'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import * as conversationServices from '~/services/conversationService'
import { ConversationMember } from '~/type/type'

interface BlockProps {
    currentMember?: ConversationMember
}

const Block: React.FC<BlockProps> = ({ currentMember }) => {
    const [isOpen, setIsOpen] = useState(false)

    const { uuid } = useParams()

    const currentUser = useAppSelector(getCurrentUser)

    const { data: conversation } = useSWR(uuid ? [SWRKey.GET_CONVERSATION_BY_UUID, uuid] : null, () => {
        return conversationServices.getConversationByUuid({ uuid: uuid as string })
    })

    const otherMember = useMemo(() => {
        return conversation?.data?.members.find((member) => member.user_id !== currentUser?.data.id)
    }, [conversation?.data?.members, currentUser?.data.id])

    const handleCloseModal = useCallback(() => {
        setIsOpen(false)
    }, [])

    const handleOpenModal = useCallback(() => {
        setIsOpen(true)
    }, [])

    const handleUnBlock = useCallback(async () => {
        try {
            setIsOpen(false)
            await conversationServices.unblockConversation({ uuid: uuid as string })
        } catch (error) {
            handleApiError(error)
        }
    }, [uuid])

    if (currentMember?.deleted_at || !currentMember) {
        return (
            <div className="flex flex-col gap-1 border-t border-light px-4 py-2 text-center text-black/90 dark:border-dark-gray dark:text-gray-300">
                <p className="font-medium text-gray-700 dark:text-gray-300">Bạn không thể nhắn tin cho nhóm này</p>
                <p className="text-xs text-[#b2b5b8]">
                    Bạn không thể nhắn tin cho nhóm này. Bạn không còn trong nhóm này và không thể gửi hoặc nhận cuộc
                    gọi hoặc tin nhắn trừ khi bạn được thêm lại vào nhóm.
                </p>
            </div>
        )
    }

    if (conversation?.data.block_conversation) {
        const blocker = conversation?.data.block_conversation.blocker

        if (blocker.id === currentUser?.data.id) {
            return (
                <>
                    <ConfirmModal
                        title={`Bỏ chặn ${otherMember?.user.full_name}`}
                        onConfirm={handleUnBlock}
                        isOpen={isOpen}
                        closeModal={handleCloseModal}
                        description={`Tài khoản HuanCanhCut của bạn sẽ bắt đầu nhận được tin nhắn hoặc cuộc gọi từ tài khoản HuanCanhCut của ${otherMember?.user.full_name}.`}
                        confirmText="Bỏ chặn"
                    />
                    <div className="flex flex-col gap-1 border-t border-light px-4 py-2 pb-4 text-center text-black/90 dark:border-dark-gray dark:text-[#e2e5e9]">
                        <div className="flex flex-col gap-1 pb-1">
                            <p className="text-center text-[13px] font-medium">
                                Bạn đã chặn tin nhắn của {otherMember?.user.full_name}
                            </p>
                            <p className="text-xs text-[#b2b5b8]">
                                Các bạn không thể nhắn tin cho nhau trong đoạn chat này
                            </p>
                        </div>
                        <Button buttonType="rounded" onClick={handleOpenModal}>
                            Bỏ chặn
                        </Button>
                    </div>
                </>
            )
        } else {
            return (
                <div className="border-t border-gray-300 px-4 py-4 text-black/90 dark:border-zinc-600 dark:text-[#e2e5e9]">
                    <p className="text-center text-[13px] text-[#b2b5b8]">
                        Hiện không liên lạc được với người này trên HuanCanhCut
                    </p>
                </div>
            )
        }
    }

    return null
}

export default Block
