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
        <div className="grid h-screen w-full grid-cols-12">
            <div className="col-span-12 sm:col-span-3">{Sidebar}</div>
            <div className={`hidden sm:col-span-6 sm:block ${infoIsOpen ? 'col-span-6' : 'col-span-9'}`}>
                {children}
            </div>
            <div className={`hidden sm:col-span-3 sm:block ${infoIsOpen ? 'block' : 'hidden'}`}>{Info}</div>
        </div>
    )
}
