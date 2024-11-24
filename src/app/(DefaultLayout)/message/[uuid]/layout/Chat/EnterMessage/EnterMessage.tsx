import { faSmile } from '@fortawesome/free-regular-svg-icons'

import { faImage } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface EnterMessageProps {
    className?: string
}

const EnterMessage: React.FC<EnterMessageProps> = ({ className = '' }) => {
    return (
        <div className={`${className} flex items-center justify-between gap-3 px-4 py-2 pb-4`}>
            <div className="flex items-center">
                <FontAwesomeIcon icon={faImage} className="cursor-pointer text-xl" />
            </div>
            <div className="relative flex flex-grow">
                <input
                    type="text"
                    className="w-full rounded-full bg-lightGray px-4 py-[6px] pr-12 outline-none dark:bg-[#333334]"
                    placeholder="Aa"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 leading-[1px]">
                    <FontAwesomeIcon icon={faSmile} className="text-xl" />
                </button>
            </div>
            <button className="text-2xl">🤣</button>
        </div>
    )
}

export default EnterMessage
