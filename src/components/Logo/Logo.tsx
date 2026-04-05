'use client'

import Image from 'next/image'
import Link from 'next/link'

import config from '~/config'
import { selectTheme } from '~/redux/selector'
import { useAppSelector } from '~/redux/types'

export default function Logo({ className = '' }: { className?: string }) {
    const theme = useAppSelector(selectTheme)

    return (
        <>
            <Link href={config.routes.home} className={className}>
                <Image
                    src={theme === 'dark' ? '/static/media/dark-logo.png' : '/static/media/light-logo.png'}
                    sizes="1000px"
                    className="h-auto w-[35px] min-w-[35px] shrink-0 cursor-pointer sm:w-[40px]"
                    alt="logo"
                    width="0"
                    height="0"
                    priority
                    quality={100}
                />
            </Link>
        </>
    )
}
