import React from 'react'

import { faUserCircle, faUserXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { StarShieldIcon } from '~/components/Icons'
import PopperWrapper from '~/components/PopperWrapper'
import { ConversationMember } from '~/type/type'

interface Option {
    title: string
    leftIcon: React.ReactNode
    type: string
}

const OPTIONS: Option[] = [
    {
        title: 'Xem trang cá nhân',
        leftIcon: <FontAwesomeIcon icon={faUserCircle} />,
        type: 'view_profile',
    },
    {
        title: 'Chỉ định làm quản trị viên',
        leftIcon: <StarShieldIcon />,
        type: 'designate_admin',
    },
    {
        title: 'Xóa thành viên',
        leftIcon: <FontAwesomeIcon icon={faUserXmark} />,
        type: 'remove_member',
    },
]

interface AccountOptionsProps {
    member: ConversationMember
}

const AccountOptions: React.FC<AccountOptionsProps> = ({ member }) => {
    const handleChose = (type: string) => {
        switch (type) {
            case 'view_profile':
                break
            case 'designate_admin':
                break
            case 'remove_member':
                break
        }
    }

    return (
        <PopperWrapper className="w-80 p-2">
            <div>
                {OPTIONS.map((option, index) => {
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
                            <span className="w-6">{option.leftIcon}</span>
                            <span>{option.title}</span>
                        </div>
                    )
                })}
            </div>
        </PopperWrapper>
    )
}

export default AccountOptions
