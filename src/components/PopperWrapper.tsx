import { memo } from 'react'

interface PopperWrapperProps {
    children: React.ReactNode
    className?: string
}

export default memo(function PopperWrapper({ children, className = '' }: PopperWrapperProps) {
    return (
        <div
            className={`max-h-[calc(100vh-100px)] rounded-md border border-gray-300 bg-white p-1 shadow-light [overflow:overlay] dark:border-gray-700 dark:bg-darkGray dark:text-dark ${className}`}
        >
            {children}
        </div>
    )
})
