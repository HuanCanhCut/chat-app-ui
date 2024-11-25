'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function MessageLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const isChatSelected = pathname.includes('/message/')

    return (
        <div className="flex h-screen max-h-[calc(100vh-var(--header-height-mobile))] w-full dark:bg-dark dark:text-dark sm:max-h-[calc(100vh-var(--header-height))]">
            <div
                className={`h-full w-full flex-shrink-0 overflow-y-auto md:w-[var(--sidebar-width-tablet)] lg:w-[var(--sidebar-width)] ${isChatSelected && 'hidden md:block'}`}
            >
                <Sidebar />
            </div>
            <div className={`h-full flex-grow overflow-y-auto md:block ${isChatSelected && 'block'}`}>
                <div className="flex h-full">
                    <div className={`w-full flex-grow`}>{children}</div>
                </div>
            </div>
        </div>
    )
}
