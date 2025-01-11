import { faArrowLeft, faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useSWR from 'swr'
import { useEffect, useState } from 'react'
import Tippy from '@tippyjs/react/headless'

import * as friendService from '~/services/friendService'
import SWRKey from '~/enum/SWRKey'
import { FriendsResponse, UserModel } from '~/type/type'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import useDebounce from '~/hooks/useDebounce'
import UserAvatar from '~/components/UserAvatar'

interface Props {
    setSearchMode: (value: boolean) => void
    searchMode: boolean
}

const Search: React.FC<Props> = ({ setSearchMode, searchMode }) => {
    const currentUser = useAppSelector(getCurrentUser)

    const [searchResult, setSearchResult] = useState<UserModel[]>([])
    const [searchValue, setSearchValue] = useState('')
    const debounceValue = useDebounce(searchValue, 250)

    const { data: friends } = useSWR<FriendsResponse | undefined>(
        currentUser?.data.nickname ? [SWRKey.GET_ALL_FRIENDS, currentUser.data.nickname] : null,
        () => {
            if (currentUser) {
                return friendService.getFriends({ user_id: currentUser.data.id })
            }
        },
    )

    useEffect(() => {
        if (debounceValue && friends) {
            const result = friends.data.filter((friend) => {
                return friend.user.full_name.toLowerCase().includes(debounceValue.toLowerCase())
            })

            const userResult = result.map((friend) => {
                return friend.user
            })

            setSearchResult(userResult)
        }
    }, [debounceValue, friends])

    const renderResult = () => {
        return (
            // 20px: padding left and right
            <div className="h-[calc(100vh-210px)] w-[calc(100vw-20px)] [overflow:overlay] dark:bg-dark sm:h-[calc(100vh-180px)] md:w-[calc(var(--sidebar-width-tablet)-20px)] lg:w-[calc(var(--sidebar-width)-20px)]">
                {searchResult.map((user) => (
                    <div
                        key={user.id}
                        className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-darkGray"
                    >
                        <UserAvatar src={user.avatar} />
                        <p>{user.full_name}</p>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div>
            <Tippy interactive visible={searchMode} placement="bottom-start" render={renderResult}>
                <div className="mt-3 flex items-center gap-2">
                    {searchMode && (
                        <FontAwesomeIcon
                            icon={faArrowLeft}
                            onClick={() => setSearchMode(false)}
                            width={22}
                            height={22}
                            className="cursor-pointer text-lg"
                        />
                    )}

                    <div className="mr-2 flex flex-1 items-center rounded-3xl bg-lightGray px-4 pl-3 dark:bg-[#313233]">
                        <FontAwesomeIcon icon={faSearch} width={16} height={16} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm trên Huancanhcut"
                            className="w-full bg-transparent px-3 py-2 outline-none"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onFocus={() => setSearchMode(true)}
                            onBlur={() => {
                                setSearchMode(false)
                                setSearchValue('')
                                setSearchResult([])
                            }}
                        />
                    </div>
                </div>
            </Tippy>
        </div>
    )
}

export default Search
