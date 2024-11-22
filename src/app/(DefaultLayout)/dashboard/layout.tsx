'use client'

import { useState } from 'react'
import Info from './Info'
import Sidebar from './Sidebar'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [infoIsOpen, setInfoIsOpen] = useState(true)

    return (
        <div className="flex h-full max-h-[calc(100vh-var(--header-mobile-height))] w-full dark:bg-dark dark:text-dark sm:max-h-[calc(100vh-var(--header-height))]">
            <div className="w-full flex-shrink-0 overflow-y-auto sm:w-80">{<Sidebar />}</div>
            <div className="hidden flex-grow overflow-y-auto sm:block">
                <div className="flex">
                    <div className={`flex-grow ${infoIsOpen ? 'w-2/3' : 'w-full'}`}>{children}</div>
                    {infoIsOpen && <div className="w-1/3 flex-shrink-0 overflow-y-auto">{<Info />}</div>}
                </div>
            </div>
        </div>
    )
}
