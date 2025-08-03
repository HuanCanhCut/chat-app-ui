import React, { memo } from 'react'
import Link from 'next/link'

import UserAvatar from '~/components/UserAvatar/UserAvatar'
import config from '~/config'
import { UserModel } from '~/type/type'

interface AccountItemProps extends Omit<React.HTMLAttributes<HTMLDivElement | HTMLAnchorElement>, 'onClick'> {
    className?: string
    user: UserModel
    // eslint-disable-next-line no-unused-vars
    onClick?: (user?: UserModel) => void
    href?: string
    avatarSize?: number
}

const AccountItem: React.FC<AccountItemProps> = ({
    className = '',
    user,
    onClick = () => {},
    href,
    avatarSize = 50,
    ...passProps
}) => {
    let Component: React.ElementType = 'div'

    const props = {
        ...passProps,
        href: href || `${config.routes.user}/@${user.nickname}`,
    }

    if (href) {
        Component = Link
    }

    return (
        <Component
            className={`flex max-w-full cursor-pointer items-center overflow-hidden rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-[#313333] ${className}`}
            onClick={() => onClick(user)}
            {...props}
        >
            <UserAvatar
                size={avatarSize}
                src={user.avatar}
                style={{ width: avatarSize + 'px', height: avatarSize + 'px' }}
            />
            <div className="ml-3 max-w-full overflow-hidden">
                <h4 className="truncate text-base font-medium">{user.full_name}</h4>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user.nickname}</p>
            </div>
        </Component>
    )
}

export default memo(AccountItem)
