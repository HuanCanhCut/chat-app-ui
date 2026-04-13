import Highlighter from 'react-highlight-words'

import UserAvatar from '~/components/UserAvatar'
import { sendEvent } from '~/helpers/events'
import { MessageModel } from '~/type/type'

interface SearchResultProps {
    message: MessageModel
    searchWords: string[]
}

const SearchResult: React.FC<SearchResultProps> = ({ message, searchWords }) => {
    const handleScrollToMessage = () => {
        sendEvent('MESSAGE:SCROLL-TO-MESSAGE', { parentMessage: message, type: 'search' })
    }

    return (
        <div
            className="dark:hover:bg-dark-gray flex cursor-pointer items-center gap-2 rounded-md px-1 py-3 hover:bg-gray-100"
            onClick={handleScrollToMessage}
        >
            <UserAvatar src={message.sender.avatar} size={32} />
            <div className="flex flex-col gap-1">
                <p className="text-sm">{message.sender.full_name}</p>

                <Highlighter
                    highlightClassName="text-black dark:text-white"
                    activeClassName="text-black dark:text-white"
                    className="text-xs text-gray-500 dark:text-gray-400"
                    activeIndex={-1}
                    highlightTag="span"
                    searchWords={searchWords}
                    autoEscape={true}
                    textToHighlight={message.content}
                    sanitize={(text: string) => {
                        return text
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/đ/g, 'd')
                            .replace(/Đ/g, 'D')
                    }}
                />
            </div>
        </div>
    )
}

export default SearchResult
