import { memo } from 'react'
import { UserModel } from '~/type/type'
import UserAvatar from '~/components/UserAvatar/UserAvatar'
import Link from 'next/link'
import config from '~/config'

interface AccountItemProps {
    className?: string
    user: UserModel
    onClick?: (user?: UserModel) => void
}

const AccountItem: React.FC<AccountItemProps> = ({ className = '', user, onClick = () => {} }) => {
    return (
        <Link
            className={`flex items-center ${className} max-w-full overflow-hidden`}
            href={`${config.routes.user}/@${user.nickname}`}
            onClick={() => onClick(user)}
        >
            <UserAvatar size={50} src={user.avatar} />
            <div className="ml-3 max-w-full overflow-hidden">
                <h4 className="truncate text-base font-medium">{user.full_name}</h4>
                <p className="truncate text-xs text-gray-500">{user.nickname}</p>
            </div>
        </Link>
    )
}

export default memo(AccountItem)
