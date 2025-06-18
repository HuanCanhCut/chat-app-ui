'use client'

import Header from './Header'
import Conversations from './Conversations'
import { useState } from 'react'
import Search from './Search'

const Sidebar = () => {
    const [searchMode, setSearchMode] = useState(false)
    return (
        <aside className="flex h-full flex-col break-all border-r border-gray-200 p-2 pr-0 dark:border-zinc-700">
            <Header />
            <Search setSearchMode={setSearchMode} searchMode={searchMode} />
            <div className="relative flex-grow [overflow:overlay]">
                <Conversations />
            </div>
        </aside>
    )
}

export default Sidebar
