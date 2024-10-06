'use client'

import Image from 'next/image'
import useThemeStore from '~/zustand/useThemeStore'

export default function Header() {
    const { theme } = useThemeStore()

    return (
        <header className="fixed left-0 right-0 top-0 z-20 flex h-[var(--header-height)] w-full items-center px-3 shadow-sm shadow-[#0000001f] dark:bg-dark dark:text-dark dark:shadow-[#ffffff1f]">
            <Image
                src={theme === 'dark' ? '/static/media/dark-logo.png' : '/static/media/light-logo.png'}
                sizes="1000px"
                className="mx-auto h-auto w-[120px] sm:mx-0"
                alt="logo"
                width="0"
                height="0"
                priority
                quality={100}
            />
        </header>
    )
}
