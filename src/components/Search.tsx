import { faSearch, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { memo } from 'react'

interface SearchProps {
    placeholder?: string
}

export default memo(function Search({ placeholder = 'Tìm kiếm' }: SearchProps) {
    return (
        <div className="bg-lightGray relative mt-4 rounded-3xl pl-10">
            <input
                type="text"
                placeholder={placeholder}
                className="w-full bg-transparent py-2 pr-11 caret-primary outline-none"
            />
            <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"
            />
            <button className="absolute right-0 top-1/2 aspect-square h-full -translate-y-1/2 rounded-full bg-slate-200 leading-none">
                <FontAwesomeIcon icon={faXmark} className="text-xl leading-none" />
            </button>
        </div>
    )
})
