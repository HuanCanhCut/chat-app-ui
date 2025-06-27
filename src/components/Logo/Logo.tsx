'use client'

import Image from 'next/image'
import Link from 'next/link'

import config from '~/config'
import { useAppSelector } from '~/redux'
import { getCurrentTheme } from '~/redux/selector'

export default function Logo({ className = '' }: { className?: string }) {
    const theme = useAppSelector(getCurrentTheme)

    return (
        <>
            <Link href={config.routes.message} className={className}>
                <Image
                    src={theme === 'dark' ? '/static/media/dark-logo.png' : '/static/media/light-logo.png'}
                    sizes="1000px"
                    className="h-auto w-[35px] cursor-pointer sm:w-[40px]"
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
