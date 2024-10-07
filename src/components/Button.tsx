import Link from 'next/link'

interface ButtonProps {
    children: React.ReactNode
    className?: string
    href?: string
    buttonType?: 'primary' | 'outline' | 'icon' | 'rounded'
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

export default function Button({ children, className, href, buttonType = 'primary', leftIcon, ...props }: ButtonProps) {
    const primaryClass = buttonType === 'primary' ? 'bg-primary px-4 py-2 rounded-md' : ''
    const outlineClass = buttonType === 'outline' ? 'border border-primary px-4 py-2 rounded-md' : ''
    const buttonIconClass = buttonType === 'icon' ? 'h-9 w-9 rounded-full bg-gray-100 dark:bg-[#313233]' : ''
    const roundedClass = buttonType === 'rounded' ? 'rounded-md px-4 py-2 dark:bg-[#313233] bg-gray-200' : ''

    if (href) {
        return (
            <Link
                href={href}
                className={`flex-center ${primaryClass} ${outlineClass} ${buttonIconClass} ${roundedClass} ${className}`}
                {...props}
            >
                {leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
            </Link>
        )
    }

    return (
        <button
            className={`flex-center ${primaryClass} ${outlineClass} ${buttonIconClass} ${roundedClass} ${className}`}
            {...props}
        >
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
        </button>
    )
}
