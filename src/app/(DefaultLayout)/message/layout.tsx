'use client'

import { useState } from 'react'
import Info from './Info'
import Sidebar from './Sidebar'

interface MessageLayoutProps {
    children: React.ReactNode
}

export default function MessageLayout({ children }: MessageLayoutProps) {
    const [infoIsOpen, setInfoIsOpen] = useState(false)

    return (
        <div className="flex h-screen max-h-[calc(100vh-var(--header-height-mobile))] w-full dark:bg-dark dark:text-dark sm:max-h-[calc(100vh-var(--header-height))]">
            <div className="h-full w-full flex-shrink-0 overflow-y-auto sm:w-[var(--sidebar-width)]">
                <Sidebar />
            </div>
            <div className="hidden h-full flex-grow overflow-y-auto sm:block">
                <div className="flex h-full">
                    <div className={`flex-grow ${infoIsOpen ? 'w-2/3' : 'w-full'}`}>{children}</div>
                    {infoIsOpen && <div className="[overflow: overlay] w-1/3">{<Info />}</div>}
                </div>
            </div>
        </div>
    )
}
