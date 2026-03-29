import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import Tippy from 'huanpenguin-tippy-react'

import { faFacebookMessenger } from '@fortawesome/free-brands-svg-icons'
import { faHome, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NavLink from '~/components/NavLink'
import config from '~/config'
import { cn } from '~/lib/utils'
import { selectCurrentUser } from '~/redux/selector'
import { useAppSelector } from '~/redux/types'

interface NavBarProps {
    className?: string
}

const NavBar = ({ className }: NavBarProps) => {
    const pathname = usePathname()
    const currentUser = useAppSelector(selectCurrentUser)

    const NAV_ITEMS = useMemo(() => {
        return [
            {
                type: 'home',
                icon: <FontAwesomeIcon icon={faHome} size="lg" className="h-[22px] w-[22px]" />,
                href: config.routes.home,
                tooltip: 'Trang chủ',
            },
            {
                type: 'messages',
                icon: <FontAwesomeIcon icon={faFacebookMessenger} size="lg" className="h-[22px] w-[22px]" />,
                href: config.routes.message,
                tooltip: 'Tin nhắn',
            },
            {
                type: 'user',
                icon: <FontAwesomeIcon icon={faUser} size="lg" className="h-[18px] w-[18px]" />,
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
                            className={`aspect-video h-full border-b-2 ${item.href === '/' ? (pathname === '/' ? 'border-primary border-b-2' : 'border-transparent') : pathname.slice(1).startsWith(item.href.slice(1)) ? 'border-primary border-b-2' : 'border-transparent'}`}
                        >
                            <NavLink
                                href={item.href}
                                className={(nav) => {
                                    return cn(
                                        'text-foreground/80 flex-center h-full rounded-md text-xl hover:bg-[#a7a7a736] dark:hover:bg-[#313333]',
                                        nav.isActive && 'text-primary',
                                    )
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
