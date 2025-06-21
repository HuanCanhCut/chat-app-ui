import { useState } from 'react'
import SearchMessage from './components/SearchMessage'
import ControlPanel from './components/ControlPanel'
interface InfoProps {
    className?: string
}

const Info: React.FC<InfoProps> = ({ className = '' }) => {
    const [searchMode, setSearchMode] = useState(false)

    return (
        <div
            className={`${className} min-h-[calc(100dvh-var(--header-mobile-height))] border-l border-gray-200 px-2 py-3 [overflow:overlay] dark:border-gray-800 sm:min-h-[calc(100dvh-var(--header-height))]`}
        >
            {searchMode ? <SearchMessage setSearchMode={setSearchMode} /> : <ControlPanel />}
        </div>
    )
}

export default Info
