import React, { useEffect, useState } from 'react'

import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useDebounce from '~/hooks/useDebounce'
import * as friendService from '~/services/friendService'
import { FriendsShip } from '~/type/type'

interface SearchFriendProps {
    placeholder?: string
    setSearchResult: (result: FriendsShip[]) => void
    className?: string
}

const SearchFriend: React.FC<SearchFriendProps> = ({ placeholder = 'Tìm kiếm', setSearchResult, className }) => {
    const [searchValue, setSearchValue] = useState('')

    const debounceValue = useDebounce(searchValue, 500)

    useEffect(() => {
        if (!debounceValue.trim()) {
            setSearchResult([])
            return
        }

        ;(async () => {
            try {
                const response = await friendService.searchFriend(debounceValue, 1, 10)

                setSearchResult(response.data)
            } catch (error) {
                console.log(error)
            }
        })()
    }, [debounceValue, setSearchResult])

    return (
        <div className={`relative w-full ${className}`}>
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
                type="text"
                className="w-full rounded-full bg-lightGray px-8 py-2 outline-none dark:bg-darkGray"
                placeholder={placeholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
            />
        </div>
    )
}

export default SearchFriend
