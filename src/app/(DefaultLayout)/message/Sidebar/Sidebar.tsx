'use client'

import Header from './components/Header'
import Friends from './components/Friends'
import { useState } from 'react'
import Search from './components/Search'

const Sidebar = () => {
    const [searchMode, setSearchMode] = useState(false)
    return (
        <aside className="flex h-full flex-col break-all border-r border-gray-200 p-2 pr-0 dark:border-gray-800">
            <Header />
            <Search setSearchMode={setSearchMode} searchMode={searchMode} />
            <div className="relative flex-grow [overflow:overlay]">
                <Friends />
            </div>
        </aside>
    )
}

export default Sidebar
