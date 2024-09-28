import Link from 'next/link'

interface ButtonProps {
    children: React.ReactNode
    className?: string
    href?: string
    buttonType?: 'primary' | 'outline' | 'icon'
}

export default function Button({ children, className, href, buttonType = 'primary', ...props }: ButtonProps) {
    const primaryClass = buttonType === 'primary' ? 'bg-primary' : ''
    const outlineClass = buttonType === 'outline' ? 'border border-primary' : ''
    const buttonIconClass = buttonType === 'icon' ? 'flex-center h-9 w-9 rounded-full bg-gray-100 dark:bg-darkGray' : ''

    if (href) {
        return (
            <Link href={href} className={`${primaryClass} ${outlineClass} ${buttonIconClass} ${className}`} {...props}>
                {children}
            </Link>
        )
    }

    return (
        <button className={`${primaryClass} ${outlineClass} ${buttonIconClass} ${className}`} {...props}>
            {children}
        </button>
    )
}
