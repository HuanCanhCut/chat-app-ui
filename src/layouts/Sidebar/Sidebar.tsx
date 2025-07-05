'use client'

import { useState } from 'react'

import Conversations from './Conversations'
import Header from './Header'
import Search from './Search'

const Sidebar = () => {
    const [searchMode, setSearchMode] = useState(false)
    return (
        <aside className="flex h-full flex-col break-all p-2 pr-0">
            <Header />
            <Search setSearchMode={setSearchMode} searchMode={searchMode} />
            <div className="relative flex-grow [overflow:overlay]">
                <Conversations />
            </div>
        </aside>
    )
}

export default Sidebar
