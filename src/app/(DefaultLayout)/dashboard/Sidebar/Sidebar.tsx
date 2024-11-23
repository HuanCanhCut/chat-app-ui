'use client'

import Header from './components/Header'
import Friends from './components/Friends'
import { useState } from 'react'
import Search from './components/Search'

const Sidebar = () => {
    const [searchMode, setSearchMode] = useState(false)
    return (
        <aside className="flex h-full flex-col break-all p-2 [overflow:overlay]">
            <Header />
            <div className="relative flex-grow [overflow:overlay]">
                <Search setSearchMode={setSearchMode} searchMode={searchMode} />
                <Friends />
            </div>
        </aside>
    )
}

export default Sidebar
