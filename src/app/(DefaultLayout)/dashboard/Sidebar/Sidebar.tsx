'use client'

import { useState } from 'react'
import Header from './components/Header'

export default function Sidebar() {
    const [searchMode, setSearchMode] = useState(false)

    return (
        <aside className="break-all [overflow:overlay]">
            <Header setSearchMode={setSearchMode} searchMode={searchMode} />
            {/* {searchMode ? <SearchResult setSearchMode={setSearchMode} searchMode={searchMode} /> : <Friends />} */}
        </aside>
    )
}
