'use client'

import Image from 'next/image'
import Link from 'next/link'
import useThemeStore from '~/zustand/useThemeStore'
import config from '~/config'

export default function Logo({ className = '' }: { className?: string }) {
    const { theme } = useThemeStore()

    return (
        <>
            <Link href={config.routes.dashboard} className={className}>
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
