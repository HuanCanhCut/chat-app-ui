'use client'

import Image from 'next/image'
import Link from 'next/link'
import useThemeStore from '~/zustand/useThemeStore'
import config from '~/config'

export default function Logo() {
    const { theme } = useThemeStore()

    return (
        <>
            <Link href={config.routes.dashboard}>
                <Image
                    src={theme === 'dark' ? '/static/media/dark-logo.png' : '/static/media/light-logo.png'}
                    sizes="1000px"
                    className="hidden h-auto w-[120px] cursor-pointer sm:mx-0 sm:block"
                    alt="logo"
                    width="0"
                    height="0"
                    priority
                    quality={100}
                />
            </Link>

            <Link href={config.routes.dashboard} className="block sm:hidden">
                <Image
                    src={theme === 'dark' ? '/static/media/dark-logo-min.png' : '/static/media/light-logo-min.png'}
                    sizes="1000px"
                    className="block h-auto w-[37px] cursor-pointer sm:mx-0 sm:hidden"
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
