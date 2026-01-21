import { memo } from 'react'

interface PopperWrapperProps {
    children: React.ReactNode
    className?: string
}

export default memo(function PopperWrapper({ children, className = '' }: PopperWrapperProps) {
    return (
        <div
            className={`${className} dark:text-dark max-h-[calc(100dvh-40px)] max-w-[calc(100vw-40px)] [overflow:overlay] rounded-md border border-gray-300 bg-white p-1 shadow-lg shadow-zinc-700/35 sm:max-h-[calc(100dvh-100px)] dark:border-zinc-700 dark:bg-[#252728] dark:shadow-zinc-900/35`}
        >
            {children}
        </div>
    )
})
