import { memo } from 'react'

interface PopperWrapperProps {
    children: React.ReactNode
    className?: string
}

export default memo(function PopperWrapper({ children, className = '' }: PopperWrapperProps) {
    return (
        <div
            className={`max-h-[90vh] rounded-md border border-gray-300 bg-white p-1 shadow-light dark:border-gray-700 dark:bg-darkGray dark:text-dark ${className}`}
        >
            {children}
        </div>
    )
})
