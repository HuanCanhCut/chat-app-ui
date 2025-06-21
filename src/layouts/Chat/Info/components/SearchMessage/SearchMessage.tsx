import { Dispatch, SetStateAction } from 'react'

interface SearchMessageProps {
    setSearchMode: Dispatch<SetStateAction<boolean>>
}

const SearchMessage: React.FC<SearchMessageProps> = ({ setSearchMode }) => {
    return <div>SearchMessage</div>
}

export default SearchMessage
