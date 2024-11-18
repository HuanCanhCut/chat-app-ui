'use client'

import { useCallback, useEffect, useState } from 'react'
import Logo from '~/components/Logo/Logo'
import Nav from './Nav'
import Interaction from './Interaction'
import Search from '~/components/Search'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from '~/components/Button'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import SearchModal from './SeachModal/SearchModal'
import { listenEvent } from '~/helpers/events'

export default function Header() {
    const [isOpen, setIsOpen] = useState(false) // Search Modal

    const headerStyle: string =
        'fixed left-0 right-0 top-0 z-20 w-full justify-between bg-white px-3 shadow-sm shadow-[#0000001f] dark:bg-darkGray dark:text-dark dark:shadow-[#ffffff1f]'

    const closeModal = useCallback(() => {
        setIsOpen(false)
    }, [])

    const openModal = useCallback(() => {
        setIsOpen(true)
    }, [])

    useEffect(() => {
        const remove = listenEvent({
            eventName: 'tippy:hide-search-modal',
            handler: () => {
                setIsOpen(false)
            },
        })

        return remove
    }, [])

    return (
        <>
            <header id="header" className={`${headerStyle} hidden h-[var(--header-height)] sm:flex sm:items-center`}>
                <div className="flex items-center gap-4">
                    <Logo className="col-span-1" />
                    <Search className="w-[240px]" />
                </div>
                <Nav />
                <Interaction />
            </header>

            <header className={`${headerStyle} flex h-[var(--header-height-mobile)] flex-col sm:hidden`}>
                <SearchModal isOpen={isOpen} closeModal={closeModal} />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Logo className="col-span-1" />
                        <Button buttonType="icon" className="sm:hidden" onClick={openModal}>
                            <FontAwesomeIcon
                                icon={faSearch}
                                width={16}
                                height={16}
                                className="text-gray-400 sm:block"
                            />
                        </Button>
                    </div>
                    <Interaction />
                </div>
                <div className="mx-auto flex-1">
                    <Nav />
                </div>
            </header>
        </>
    )
}
