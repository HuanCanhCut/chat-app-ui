import { memo } from 'react'

interface PopperWrapperProps {
    children: React.ReactNode
    className?: string
}

export default memo(function PopperWrapper({ children, className = '' }: PopperWrapperProps) {
    return <div className={`rounded-md bg-white p-1 shadow-light ${className}`}>{children}</div>
})
