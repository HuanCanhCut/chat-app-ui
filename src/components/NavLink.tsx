import Link from 'next/link'
import { usePathname } from 'next/navigation'
export default function NavLink({
    children,
    href,
    className = '',
}: {
    children: React.ReactNode
    href: string
    className?: string
}) {
    const pathname = usePathname()

    console.log(pathname, href)

    return (
        <Link href={href} className={`${pathname === href ? 'text-primary' : ''} ${className}`}>
            {children}
        </Link>
    )
}
