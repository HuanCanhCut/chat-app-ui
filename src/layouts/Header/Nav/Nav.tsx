import { useMemo } from 'react'
import { usePathname } from 'next/navigation'

import Tippy from '@vendor/tippy'
import { HomeIcon, UserGroupIcon } from '~/components/Icons'
import NavLink from '~/components/NavLink'
import config from '~/config'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'

interface NavBarProps {
    className?: string
}

const NavBar = ({ className }: NavBarProps) => {
    const pathname = usePathname()
    const currentUser = useAppSelector(getCurrentUser)

    const NAV_ITEMS = useMemo(() => {
        return [
            {
                type: 'home',
                icon: <HomeIcon />,
                href: config.routes.message,
                tooltip: 'Trang chủ',
            },
            {
                type: 'user',
                icon: <UserGroupIcon />,
                href: `${config.routes.user}/@${currentUser?.data?.nickname}`,
                tooltip: 'Tài khoản',
            },
        ]
    }, [currentUser])

    return (
        <nav className={`relative flex h-full items-center ${className}`}>
            {NAV_ITEMS.map((item, index) => {
                return (
                    <Tippy content={item.tooltip} key={index} delay={[250, 0]}>
                        <div
                            className={`aspect-video h-full border-b-2 ${pathname.startsWith(item.href) ? 'border-primary border-b-2' : 'border-transparent'}`}
                        >
                            <NavLink
                                href={item.href}
                                className={(nav) => {
                                    return `${nav.isActive ? 'text-primary' : ''} flex-center h-full rounded-md text-xl hover:bg-[#a7a7a736] dark:hover:bg-[#313333]`
                                }}
                            >
                                {item.icon}
                            </NavLink>
                        </div>
                    </Tippy>
                )
            })}
        </nav>
    )
}

export default NavBar
