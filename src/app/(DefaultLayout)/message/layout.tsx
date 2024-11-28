'use client'

import { useParams } from 'next/navigation'
import Sidebar from './Sidebar'

export default function MessageLayout({ children }: { children: React.ReactNode }) {
    const { uuid } = useParams()

    return (
        <div className="flex h-screen max-h-[calc(100vh-var(--header-height-mobile))] w-full dark:bg-dark dark:text-dark sm:max-h-[calc(100vh-var(--header-height))]">
            <div
                className={`h-full w-full flex-shrink-0 overflow-y-auto md:w-[var(--sidebar-width-tablet)] lg:w-[var(--sidebar-width)] ${uuid && 'hidden md:block'}`}
            >
                <Sidebar />
            </div>
            <div className={`h-full flex-grow overflow-y-auto md:block ${uuid && 'block'}`}>
                <div className="flex h-full">
                    <div className={`w-full flex-grow`}>{children}</div>
                </div>
            </div>
        </div>
    )
}
