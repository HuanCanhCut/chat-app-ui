import { useMemo } from 'react'
import Tippy from '@tippyjs/react'
import { usePathname } from 'next/navigation'

import { HomeIcon, UserGroupIcon } from '~/components/Icons'
import config from '~/config'
import NavLink from '~/components/NavLink'
import getCurrentUser from '~/zustand/getCurrentUser'
const NavBar = () => {
    const pathname = usePathname()

    const { currentUser } = getCurrentUser()

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
                href: `/user/@${currentUser?.data?.nickname}`,
                tooltip: 'Tài khoản',
            },
        ]
    }, [currentUser])

    return (
        <nav className="relative flex h-full items-center">
            {NAV_ITEMS.map((item, index) => {
                return (
                    <Tippy content={item.tooltip} key={index}>
                        <div
                            className={`aspect-[16/9] h-full border-b-2 ${pathname === item.href ? 'border-b-2 border-primary' : 'border-transparent'}`}
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
