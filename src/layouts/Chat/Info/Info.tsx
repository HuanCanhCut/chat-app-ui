import { useState } from 'react'

import ControlPanel from './components/ControlPanel'
import SearchMessage from './components/SearchMessage'
interface InfoProps {
    className?: string
}

const Info: React.FC<InfoProps> = ({ className = '' }) => {
    const [searchMode, setSearchMode] = useState(false)

    return (
        <div
            id="info-container"
            className={`${className} min-h-[calc(100dvh-var(--header-mobile-height))] px-2 py-3 [overflow:overlay] sm:min-h-[calc(100dvh-var(--header-height))]`}
        >
            {searchMode ? <SearchMessage /> : <ControlPanel setSearchMode={setSearchMode} />}
        </div>
    )
}

export default Info
