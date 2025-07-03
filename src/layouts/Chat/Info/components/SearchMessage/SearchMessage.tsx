import { useCallback, useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useParams } from 'next/navigation'

import SearchResult from './SearchResult'
import { faSearch, faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from '~/components/Button'
import { sendEvent } from '~/helpers/events'
import handleApiError from '~/helpers/handleApiError'
import useDebounce from '~/hooks/useDebounce'
import * as searchServices from '~/services/searchService'
import { SearchMessageResponse } from '~/type/type'

const PER_PAGE = 20

const SearchMessage: React.FC = () => {
    const { uuid } = useParams()

    const [searchValue, setSearchValue] = useState('')
    const [searchResult, setSearchResult] = useState<SearchMessageResponse | null>(null)
    const [page, setPage] = useState(1)

    const debounceValue = useDebounce(searchValue, 400)

    const inputRef = useRef<HTMLInputElement>(null)

    const handleCloseInfo = () => {
        sendEvent({
            eventName: 'info:toggle',
            detail: {
                isOpen: false,
            },
        })
    }

    useEffect(() => {
        if (!debounceValue) {
            setSearchResult(null)
            return
        }

        ;(async () => {
            try {
                const response = await searchServices.searchMessage({
                    q: debounceValue,
                    page,
                    per_page: PER_PAGE,
                    conversation_uuid: uuid as string,
                })

                setSearchResult(response)
            } catch (error) {
                handleApiError(error, 'Lỗi tìm kiếm tin nhắn')
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounceValue, uuid])

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const handleClearSearch = useCallback(() => {
        setSearchValue('')
        setSearchResult(null)
        setPage(1)
    }, [])

    return (
        <>
            <div className="flex items-center gap-2">
                <Button
                    buttonType="icon"
                    className="bg-transparent text-xl dark:bg-transparent"
                    onClick={handleCloseInfo}
                >
                    <FontAwesomeIcon icon={faXmark} width={24} height={24} />
                </Button>
                <span>Tìm kiếm</span>
            </div>
            <div className="relative mt-4 flex items-center rounded-3xl bg-lightGray pl-3 dark:bg-[#313233]">
                <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => {
                        inputRef.current?.focus()
                    }}
                />
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full select-none overflow-hidden truncate text-ellipsis bg-transparent px-3 py-[6px] pl-6 text-sm font-normal outline-none"
                    placeholder="Tìm kiếm trong cuộc trò chuyện"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
                {searchResult && (
                    <div className="flex items-center gap-2">
                        <span className="whitespace-nowrap text-sm leading-none text-gray-500 dark:text-gray-400">
                            {searchResult.meta.pagination.total} kết quả
                        </span>
                        <Button
                            buttonType="icon"
                            className="!h-8 !w-8 bg-[#E2E5E9] dark:bg-[#FFFFFF1A]"
                            onClick={handleClearSearch}
                        >
                            <FontAwesomeIcon icon={faXmark} width={24} height={24} />
                        </Button>
                    </div>
                )}
            </div>

            <div className="mt-1">
                <InfiniteScroll
                    dataLength={searchResult?.data.length || 0}
                    next={async () => {
                        try {
                            const response = await searchServices.searchMessage({
                                q: debounceValue,
                                page: page + 1,
                                per_page: PER_PAGE,
                                conversation_uuid: uuid as string,
                            })

                            setSearchResult((prev) => {
                                if (!prev) {
                                    return response
                                }

                                return {
                                    data: [...prev.data, ...response.data],
                                    meta: response.meta,
                                }
                            })

                            setPage(page + 1)
                        } catch (error) {
                            handleApiError(error, 'Có lỗi trong quá trình tải thêm tin nhắn.')
                        }
                    }}
                    className="!overflow-hidden"
                    hasMore={
                        searchResult
                            ? searchResult.meta.pagination.current_page < searchResult.meta.pagination.total_pages
                            : false
                    }
                    loader={
                        <div className="flex justify-center">
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        </div>
                    }
                    scrollableTarget="info-container"
                    scrollThreshold={0.9}
                >
                    {searchResult?.data.map((message) => {
                        return (
                            <SearchResult key={message.id} message={message} searchWords={debounceValue.split(' ')} />
                        )
                    })}
                </InfiniteScroll>
            </div>
        </>
    )
}

export default SearchMessage
