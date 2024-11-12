import { faSearch, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { memo, useState } from 'react'
import { UserResponse } from '~/type/type'

interface SearchProps {
    placeholder?: string
}

export default memo(function Search({ placeholder = 'Tìm kiếm' }: SearchProps) {
    const [searchResult, setSearchResult] = useState<UserResponse[]>([])
    return (
        <div className="relative mt-4 rounded-3xl bg-lightGray pl-10 dark:bg-darkGray">
            <input
                type="text"
                placeholder={placeholder}
                className="w-fu ll rounded-3xl bg-transparent py-[8px] pr-11 caret-primary outline-none placeholder:text-sm dark:bg-darkGray"
            />
            <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"
                width={20}
                height={20}
            />
            {searchResult.length > 0 ||
                (true && (
                    <button className="absolute right-0 top-1/2 aspect-square h-full -translate-y-1/2 rounded-full leading-none">
                        <FontAwesomeIcon icon={faXmark} className="text-xl leading-none" width={16} height={16} />
                    </button>
                ))}
        </div>
    )
})
