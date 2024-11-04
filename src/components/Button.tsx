import Link from 'next/link'
import { memo } from 'react'

interface ButtonProps {
    children: React.ReactNode
    className?: string
    href?: string
    buttonType?: 'primary' | 'outline' | 'icon' | 'rounded'
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    onClick?: () => void
    type?: 'button' | 'submit' | 'reset'
}

const Button = ({
    children,
    className,
    href,
    buttonType = 'primary',
    leftIcon,
    type = 'button',
    onClick,
    ...props
}: ButtonProps) => {
    const primaryClass = buttonType === 'primary' ? 'bg-primary px-4 py-[6px] rounded-md text-white' : ''
    const outlineClass = buttonType === 'outline' ? 'border border-gray-300 px-4 py-[6px] rounded-md' : ''
    const buttonIconClass =
        buttonType === 'icon' ? 'h-7 w-7 xxs:h-9 xxs:w-9 flex-center rounded-full bg-gray-100 dark:bg-[#313233]' : ''
    const roundedClass = buttonType === 'rounded' ? 'rounded-md px-4 py-[6px] dark:bg-[#313233] bg-gray-300' : ''

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
            onClick={onClick}
        >
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
        </button>
    )
}

export default memo(Button)
