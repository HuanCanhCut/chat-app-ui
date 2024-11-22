import { faArrowLeft, faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useSWR from 'swr'
import { useEffect, useState } from 'react'

import * as friendService from '~/services/friendService'
import SWRKey from '~/enum/SWRKey'
import { FriendsResponse, UserModel } from '~/type/type'
import getCurrentUser from '~/zustand/getCurrentUser'
import useDebounce from '~/hooks/useDebounce'

interface Props {
    setSearchMode: (value: boolean) => void
    searchMode: boolean
}

const Search: React.FC<Props> = ({ setSearchMode, searchMode }) => {
    const { currentUser } = getCurrentUser()
    const [searchResult, setSearchResult] = useState<UserModel[]>([])

    const [searchValue, setSearchValue] = useState('')

    const debounceValue = useDebounce(searchValue, 250)

    const { data: friends } = useSWR<FriendsResponse | undefined>(
        currentUser ? [SWRKey.GET_ALL_FRIENDS, currentUser] : null,
        () => {
            if (currentUser) {
                return friendService.getFriends({ user_id: currentUser.data.id })
            }
        },
    )

    useEffect(() => {
        if (debounceValue && friends) {
            const result = friends.data.filter((friend) => {
                return friend.user.full_name.includes(debounceValue)
            })

            const userResult = result.map((friend) => {
                return friend.user
            })

            setSearchResult(userResult)
        }
    }, [debounceValue, friends])

    useEffect(() => {
        console.log(searchResult)
    }, [searchResult])

    return (
        <div className="mt-6 flex items-center gap-2">
            {searchMode && (
                <FontAwesomeIcon
                    icon={faArrowLeft}
                    onClick={() => setSearchMode(false)}
                    width={22}
                    height={22}
                    className="cursor-pointer text-lg"
                />
            )}

            <div className="flex flex-1 items-center rounded-3xl bg-[#f0f2f5] px-4 pl-3 dark:bg-[#313233]">
                <FontAwesomeIcon icon={faSearch} width={16} height={16} />
                <input
                    type="text"
                    placeholder="Tìm kiếm trên Huancanhcut"
                    className="w-full bg-transparent px-3 py-2 outline-none"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setSearchMode(true)}
                    onBlur={() => setSearchMode(false)}
                />
            </div>
        </div>
    )
}

export default Search
