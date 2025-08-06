import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { mutate } from 'swr'

import Button from '../Button'
import ConfirmModal from '../ConfirmModal'
import LeaveGroupModal from '../LeaveGroupModal'
import Modal from '../Modal'
import PopperWrapper from '../PopperWrapper'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faArrowRightFromBracket, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SWRKey from '~/enum/SWRKey'
import * as conversationService from '~/services/conversationService'
import { ConversationModel } from '~/type/type'

interface Props {
    conversation: ConversationModel
    tippyInstanceRef: any
}

interface Option {
    label: string
    icon: IconProp
    onClick: () => void
}

interface ModalState {
    isOpen: boolean
    title: string
    component: React.ReactNode
}

const ConversationOptions: React.FC<Props> = ({ conversation, tippyInstanceRef }) => {
    const { uuid } = useParams()
    const router = useRouter()

    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        title: '',
        component: null,
    })

    const handleCloseModal = () => {
        setModalState({
            isOpen: false,
            title: '',
            component: null,
        })
    }

    const OPTIONS: Option[] = [
        {
            label: 'Xóa cuộc trò chuyện',
            icon: faTrash,
            onClick: () => {
                tippyInstanceRef.current.hide()
                setModalState({
                    isOpen: true,
                    title: 'Xóa cuộc trò chuyện',
                    component: (
                        <ConfirmModal
                            title="Xóa đoạn chat"
                            description="Bạn không thể hoàn tác sau khi xóa bản sao của cuộc trò chuyện này."
                            onConfirm={async () => {
                                handleCloseModal()

                                await conversationService.deleteConversation({ uuid: conversation.uuid })

                                interface Conversation<T> {
                                    [key: string]: T
                                }

                                mutate(
                                    SWRKey.GET_CONVERSATIONS,
                                    (prev: { data: Conversation<ConversationModel> } | undefined) => {
                                        if (!prev) return prev

                                        const newData = { ...prev.data }

                                        delete newData[conversation.uuid]

                                        console.log({
                                            ...prev,
                                            data: newData,
                                        })

                                        return {
                                            ...prev,
                                            data: newData,
                                        }
                                    },
                                    {
                                        revalidate: false,
                                    },
                                )

                                if (uuid === conversation.uuid) {
                                    router.push('/')
                                }
                            }}
                            isOpen={true}
                            closeModal={handleCloseModal}
                        />
                    ),
                })
            },
        },
        conversation.is_group && {
            label: 'Rời nhóm',
            icon: faArrowRightFromBracket,
            onClick: () => {
                tippyInstanceRef.current.hide()
                setModalState({
                    isOpen: true,
                    title: 'Rời nhóm',
                    component: <LeaveGroupModal onClose={handleCloseModal} conversation={conversation} />,
                })
            },
        },
    ].filter(Boolean) as Option[]

    return (
        <PopperWrapper>
            <Modal
                isOpen={modalState.isOpen}
                onClose={handleCloseModal}
                popperClassName={`!p-0 !overflow-hidden flex flex-col`}
                title={modalState.title}
            >
                {modalState.component}
            </Modal>

            <div>
                {OPTIONS.map((option) => (
                    <Button
                        key={option.label}
                        buttonType="rounded"
                        className="w-full !justify-start bg-transparent dark:bg-transparent"
                        leftIcon={<FontAwesomeIcon icon={option.icon} />}
                        onClick={option.onClick}
                    >
                        {option.label}
                    </Button>
                ))}
            </div>
        </PopperWrapper>
    )
}

export default ConversationOptions
