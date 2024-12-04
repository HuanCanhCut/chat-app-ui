'use client'

import { useParams } from 'next/navigation'
import Sidebar from './Sidebar'

export default function MessageLayout({ children }: { children: React.ReactNode }) {
    const { uuid } = useParams()

    return (
        <div className="flex h-screen max-h-[calc(100vh-var(--header-height-mobile))] w-full dark:bg-dark dark:text-dark sm:max-h-[calc(100vh-var(--header-height))]">
            <div
                className={`bp900:w-[var(--sidebar-width-tablet)] h-full w-full flex-shrink-0 overflow-y-auto lg:w-[var(--sidebar-width)] ${uuid && 'bp900:block hidden'}`}
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
