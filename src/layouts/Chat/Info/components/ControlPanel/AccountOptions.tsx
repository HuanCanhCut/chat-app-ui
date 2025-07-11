import React from 'react'

import { faSignOut, faUserCircle, faUserXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { StarShieldIcon } from '~/components/Icons'
import PopperWrapper from '~/components/PopperWrapper'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
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
    const currentUser = useAppSelector(getCurrentUser)

    const handleChose = (type: string) => {
        switch (type) {
            case 'view_profile':
                break
            case 'designate_admin':
                break
            case 'remove_admin':
                break
            case 'remove_member':
                break
            case 'leave_group':
                break
        }
    }

    const ADMIN_OPTIONS: Option[] = [
        isAdmin && {
            title: member.role === 'member' ? 'Chỉ định làm quản trị viên' : 'Gỡ vai trò quản trị viên',
            leftIcon: <StarShieldIcon />,
            type: member.role === 'member' ? 'designate_admin' : 'remove_admin',
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
