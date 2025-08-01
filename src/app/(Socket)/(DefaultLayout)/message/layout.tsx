'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { mutate } from 'swr'

import SWRKey from '~/enum/SWRKey'
import Sidebar from '~/layouts/Sidebar'

export default function MessageLayout({ children }: { children: React.ReactNode }) {
    const { uuid } = useParams()

    useEffect(() => {
        mutate(SWRKey.GET_UNSEEN_COUNT, 0, { revalidate: false })
    }, [])

    return (
        <div className="flex h-dvh max-h-[calc(100dvh-var(--header-height-mobile))] w-full dark:bg-dark dark:text-dark sm:max-h-[calc(100dvh-var(--header-height))]">
            <div
                className={`h-full w-full flex-shrink-0 overflow-y-auto bp900:w-[var(--sidebar-width-tablet)] lg:w-[var(--sidebar-width)] ${uuid && 'hidden bp900:block'}`}
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
