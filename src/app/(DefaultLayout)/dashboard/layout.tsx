'use client'

import { useState } from 'react'

interface DashboardLayoutProps {
    children: React.ReactNode
    Sidebar: React.ReactNode
    Info: React.ReactNode
}

export default function DashboardLayout({ children, Sidebar, Info }: DashboardLayoutProps) {
    const [infoIsOpen, setInfoIsOpen] = useState(true)

    return (
        <div className="flex min-h-screen w-full dark:bg-dark dark:text-dark">
            <div className="w-full flex-shrink-0 overflow-y-auto sm:w-80">{Sidebar}</div>
            <div className="hidden flex-grow overflow-y-auto sm:block">
                <div className="flex h-full">
                    <div className={`flex-grow ${infoIsOpen ? 'w-2/3' : 'w-full'}`}>{children}</div>
                    {infoIsOpen && <div className="w-1/3 flex-shrink-0 overflow-y-auto">{Info}</div>}
                </div>
            </div>
        </div>
    )
}
