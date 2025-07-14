import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AxiosError } from 'axios'

import { faSignOut, faUserCircle, faUserXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ConfirmModel from '~/components/ConfirmModal'
import { StarShieldIcon } from '~/components/Icons'
import PopperWrapper from '~/components/PopperWrapper'
import config from '~/config'
import { sendEvent } from '~/helpers/events'
import handleApiError from '~/helpers/handleApiError'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import * as conversationService from '~/services/conversationService'
import { ConversationMember } from '~/type/type'
interface Option {
    title: string
    leftIcon: React.ReactNode
    type: string
}

const BASE_OPTIONS: Option[] = [
    {
        title: 'Xem trang cá nhân',
        leftIcon: <FontAwesomeIcon width={20} height={20} icon={faUserCircle} />,
        type: 'view_profile',
    },
]

interface AccountOptionsProps {
    member: ConversationMember
    isAdmin?: boolean
}

const AccountOptions: React.FC<AccountOptionsProps> = ({ member, isAdmin }) => {
    const { uuid } = useParams()

    const router = useRouter()

    const currentUser = useAppSelector(getCurrentUser)

    const [confirmModalState, setConfirmModalState] = useState({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => {},
    })

    const handleChose = async (type: string) => {
        switch (type) {
            case 'view_profile':
                router.push(`${config.routes.user}/@${member.user.nickname}`)
                break
            case 'designate_admin':
                setConfirmModalState({
                    isOpen: true,
                    title: 'Thêm quản trị viên nhóm?',
                    description: `Là quản trị viên nhóm, "${member.user.full_name}" có thể quyết định ai có thể tham gia và tùy chỉnh cuộc trò chuyện này.`,
                    onConfirm: async () => {
                        try {
                            await conversationService.designateLeader({
                                uuid: uuid as string,
                                userId: member.user_id,
                            })

                            setConfirmModalState({
                                ...confirmModalState,
                                isOpen: false,
                            })
                        } catch (error) {
                            if (error instanceof AxiosError) {
                                handleApiError(error)
                            }
                        }
                    },
                })

                break
            case 'remove_leader':
                setConfirmModalState({
                    isOpen: true,
                    title: 'Gỡ vai trò quản trị viên nhóm?',
                    description: `"${member.user.full_name}" sẽ không quản lý được người có thể tham gia và tùy chỉnh cuộc trò chuyện này nữa.`,
                    onConfirm: async () => {
                        try {
                            await conversationService.removeLeader({
                                uuid: uuid as string,
                                userId: member.user_id,
                            })

                            setConfirmModalState({
                                ...confirmModalState,
                                isOpen: false,
                            })
                        } catch (error) {
                            if (error instanceof AxiosError) {
                                handleApiError(error)
                            }
                        }
                    },
                })

                break
            case 'remove_member':
                break
            case 'leave_group':
                break
        }

        sendEvent({ eventName: 'tippy:hide' })
    }

    const ADMIN_OPTIONS: Option[] = [
        isAdmin && {
            title: member.role === 'member' ? 'Chỉ định làm quản trị viên' : 'Gỡ vai trò quản trị viên',
            leftIcon: <StarShieldIcon />,
            type: member.role === 'member' ? 'designate_admin' : 'remove_leader',
        },
        isAdmin && {
            title: 'Xóa thành viên',
            leftIcon: <FontAwesomeIcon width={20} height={20} icon={faUserXmark} />,
            type: 'remove_member',
        },
    ].filter(Boolean) as Option[]

    const USER_OPTIONS: Option[] = [
        ...BASE_OPTIONS,
        ...(currentUser?.data.id !== member.user_id && member.role !== 'admin' ? ADMIN_OPTIONS : []),
        currentUser?.data.id === member.user_id && {
            title: 'Rời nhóm',
            leftIcon: <FontAwesomeIcon width={20} height={20} icon={faSignOut} />,
            type: 'leave_group',
        },
    ].filter(Boolean) as Option[]

    return (
        <PopperWrapper className="w-80 p-2">
            <ConfirmModel
                title={confirmModalState.title}
                description={confirmModalState.description}
                onConfirm={confirmModalState.onConfirm}
                isOpen={confirmModalState.isOpen}
                closeModal={() => setConfirmModalState({ ...confirmModalState, isOpen: false })}
            />
            <div>
                {USER_OPTIONS.map((option, index) => {
                    return (
                        <div
                            key={index}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 hover:bg-gray-100 dark:hover:bg-darkGray"
                            onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                handleChose(option.type)
                            }}
                        >
                            <span className="w-6 text-xl">{option.leftIcon}</span>
                            <span>{option.title}</span>
                        </div>
                    )
                })}
            </div>
        </PopperWrapper>
    )
}

export default AccountOptions
