import { memo } from 'react'
import { UserModel } from '~/type/type'
import UserAvatar from './UserAvatar'

interface AccountItemProps {
    className?: string
    user: UserModel
}

export default memo(function AccountItem({ className = '', user }: AccountItemProps) {
    return (
        <div className={`flex items-center ${className}`}>
            <UserAvatar size={56} src={user.avatar} />
            <div className="ml-3">
                <h4 className="text-base font-medium">{user.full_name}</h4>
                <p className="text-xs text-gray-500">{user.email}</p>
            </div>
        </div>
    )
})
