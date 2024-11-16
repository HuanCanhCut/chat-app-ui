'use client'

import Logo from '~/components/Logo/Logo'
import Nav from './Nav'
import Interaction from './Interaction'

export default function Header() {
    const headerStyle: string =
        'fixed left-0 right-0 top-0 z-20 w-full justify-between bg-white px-3 shadow-sm shadow-[#0000001f] dark:bg-darkGray dark:text-dark dark:shadow-[#ffffff1f]'

    return (
        <>
            <header id="header" className={`${headerStyle} hidden h-[var(--header-height)] sm:flex sm:items-center`}>
                <Logo className="col-span-1" />
                <Nav />
                <Interaction />
            </header>

            <header className={`${headerStyle} flex h-[var(--header-height-mobile)] flex-col sm:hidden`}>
                <div className="flex items-center justify-between">
                    <Logo className="col-span-1" />
                    <Interaction />
                </div>
                <div className="mx-auto flex-1">
                    <Nav />
                </div>
            </header>
        </>
    )
}
