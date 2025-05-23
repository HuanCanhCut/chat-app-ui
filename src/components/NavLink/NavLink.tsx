import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
    children: React.ReactNode
    href: string
    // eslint-disable-next-line no-unused-vars
    className?: (options: { isActive: boolean }) => string
}

export default function NavLink({ children, href, className = () => '' }: NavLinkProps) {
    const pathname = usePathname()

    const options = {
        isActive: pathname === href,
    }

    return (
        <Link href={href} className={className(options)}>
            {children}
        </Link>
    )
}
