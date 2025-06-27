import { memo, useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'

import AccountItem from '../AccountItem'
import PopperWrapper from '../PopperWrapper'
import { faSearch, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@tippyjs/react/headless'
import SWRKey from '~/enum/SWRKey'
import { sendEvent } from '~/helpers/events'
import useDebounce from '~/hooks/useDebounce'
import * as searchService from '~/services/searchService'
import { SearchHistory, SearchHistoryData, UserModel } from '~/type/type'

interface SearchProps {
    placeholder?: string
    className?: string
}

const Search: React.FC<SearchProps> = ({ placeholder = 'Tìm kiếm', className = '' }) => {
    const [searchResult, setSearchResult] = useState<UserModel[]>([])
    const [searchValue, setSearchValue] = useState('')
    const [showResult, setShowResult] = useState(false)

    const debounceValue = useDebounce(searchValue, 500)

    const [searchHistoryResult, setSearchHistoryResult] = useState<SearchHistoryData[]>([])

    const { data: searchHistory, mutate } = useSWR<SearchHistory | undefined>(SWRKey.SEARCH_HISTORY, () => {
        return searchService.getSearchHistory()
    })

    useEffect(() => {
        if (searchHistory) {
            setSearchHistoryResult(searchHistory.data)
        }
    }, [searchHistory])

    useEffect(() => {
        // Nếu không có giá trị thì không cần tìm kiếm
        if (!debounceValue.trim()) {
            setSearchResult([])
            return
        }

        const searchUser = async () => {
            const response = await searchService.searchUser(debounceValue)
            if (response) {
                setSearchResult(response.data)
            }
        }

        searchUser()
    }, [debounceValue])

    const handleHideTippy = useCallback(() => {
        setShowResult(false)
    }, [])

    const handleSetSearchHistory = useCallback(
        (user?: UserModel) => {
            handleHideTippy()

            sendEvent({ eventName: 'tippy:hide-search-modal' })

            const getSearchHistory = async () => {
                // Set search history
                if (user) {
                    await searchService.setSearchHistory(user.id)

                    // Get search history after set
                    mutate()
                }
            }

            getSearchHistory()
        },
        [handleHideTippy, mutate],
    )

    const renderResult = (attrs: any) => {
        return (
            <PopperWrapper className="w-[360px] p-4" {...attrs} tabIndex={-1}>
                <div>
                    <h4>Mới đây</h4>
                    <div className="mt-2 flex flex-col gap-4">
                        {searchResult.length > 0
                            ? searchValue.trim() !== '' &&
                              searchResult.map((user, index) => (
                                  <AccountItem key={index} user={user} onClick={handleSetSearchHistory} />
                              ))
                            : searchHistoryResult.length > 0 &&
                              searchValue.trim() === '' &&
                              searchHistoryResult.map((item) => {
                                  return (
                                      <AccountItem
                                          key={item.id}
                                          user={item.user_search}
                                          onClick={handleSetSearchHistory}
                                      />
                                  )
                              })}
                    </div>
                </div>
            </PopperWrapper>
        )
    }

    return (
        <Tippy
            interactive
            onClickOutside={handleHideTippy}
            visible={
                showResult && (searchResult.length > 0 || (searchHistoryResult.length > 0 && searchValue.trim() === ''))
            }
            render={renderResult}
            placement="bottom-start"
        >
            <div className={`relative rounded-3xl bg-lightGray pl-3 dark:bg-[#313233] sm:pl-10 ${className}`}>
                <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full rounded-3xl bg-transparent py-[8px] pl-[1px] pr-11 caret-primary outline-none placeholder:text-sm dark:bg-[#313233]"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setShowResult(true)}
                />
                <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 hidden -translate-y-1/2 text-xl text-gray-400 sm:block"
                    width={16}
                    height={16}
                />
                {searchResult.length > 0 ||
                    (true && (
                        <button className="absolute right-0 top-1/2 block aspect-square h-full -translate-y-1/2 rounded-full leading-none sm:hidden">
                            <FontAwesomeIcon icon={faXmark} className="text-xl leading-none" width={16} height={16} />
                        </button>
                    ))}
            </div>
        </Tippy>
    )
}

export default memo(Search)
