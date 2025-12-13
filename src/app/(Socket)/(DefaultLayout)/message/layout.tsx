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
        <div className="dark:bg-dark dark:text-dark flex h-dvh max-h-[calc(100dvh-var(--header-height-mobile))] w-full sm:max-h-[calc(100dvh-var(--header-height))]">
            <div
                className={`bp900:w-(--sidebar-width-tablet) h-full w-full shrink-0 overflow-y-auto lg:w-(--sidebar-width) ${uuid && 'bp900:block hidden'}`}
            >
                <Sidebar />
            </div>
            <div className={`h-full grow overflow-y-auto md:block ${uuid && 'block'}`}>
                <div className="flex h-full">
                    <div className={`w-full grow`}>{children}</div>
                </div>
            </div>
        </div>
    )
}
