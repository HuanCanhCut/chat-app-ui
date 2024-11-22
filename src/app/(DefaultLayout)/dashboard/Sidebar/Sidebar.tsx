'use client'

import Header from './components/Header'
import Friends from './components/Friends'
import { useState } from 'react'
import Search from './components/Search'

const Sidebar = () => {
    const [searchMode, setSearchMode] = useState(false)
    return (
        <aside className="h-full break-all p-2 [overflow:overlay]">
            <Header />
            <div className="relative">
                <Search setSearchMode={setSearchMode} searchMode={searchMode} />
                <Friends />
            </div>
        </aside>
    )
}

export default Sidebar
