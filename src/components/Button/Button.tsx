import { memo } from 'react'
import Link from 'next/link'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
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
    rightIcon,
    type = 'button',
    onClick,
    ...props
}: ButtonProps) => {
    const primaryClass =
        buttonType === 'primary' ? 'bg-primary px-4 py-[6px] rounded-md text-white hover:bg-primary/85' : ''

    const outlineClass =
        buttonType === 'outline'
            ? 'border border-gray-300 px-4 py-[6px] rounded-md  dark:hover:bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(0,0,0,0.05)]'
            : ''
    const buttonIconClass =
        buttonType === 'icon'
            ? 'h-7 w-7 xxs:h-9  xxs:w-9 flex-center rounded-full bg-lightGray dark:bg-[#313233] hover:bg-[#99999936] dark:hover:bg-[#383b3b]'
            : ''
    const roundedClass =
        buttonType === 'rounded'
            ? 'rounded-md px-4 py-[6px] dark:bg-[#313233] hover:bg-[#99999936] dark:hover:bg-[#333636] bg-gray-200'
            : ''

    const baseClass = `flex-center ${primaryClass} ${outlineClass} ${buttonIconClass} ${roundedClass} ${className}`

    const disabledClass = `opacity-50 cursor-not-allowed dark:bg-[#ffffff19] bg-[#E2E5E9] rounded-md px-4 py-[6px] ${className}`

    if (href) {
        return (
            <Link
                href={href}
                className={`flex-center ${primaryClass} ${outlineClass} ${buttonIconClass} ${roundedClass} ${className}`}
                {...props}
            >
                {leftIcon && (
                    <span data-left-icon className="mr-2">
                        {leftIcon}
                    </span>
                )}
                {children}
                {rightIcon && (
                    <span data-right-icon className="ml-2">
                        {rightIcon}
                    </span>
                )}
            </Link>
        )
    }

    return (
        <button className={props.disabled ? disabledClass : baseClass} onClick={onClick} type={type} {...props}>
            {leftIcon && (
                <span data-left-icon className="mr-2">
                    {leftIcon}
                </span>
            )}
            {children}
            {rightIcon && (
                <span data-right-icon className="ml-2">
                    {rightIcon}
                </span>
            )}
        </button>
    )
}

export default memo(Button)
