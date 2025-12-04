import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AxiosError } from 'axios'

import { faArrowLeft, faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@vendor/tippy/headless'
import UserAvatar from '~/components/UserAvatar'
import config from '~/config'
import useDebounce from '~/hooks/useDebounce'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import * as conversationService from '~/services/conversationService'
import { ConversationModel } from '~/type/type'

interface Props {
    // eslint-disable-next-line no-unused-vars
    setSearchMode: (value: boolean) => void
    searchMode: boolean
}

const Search: React.FC<Props> = ({ setSearchMode, searchMode }) => {
    const { uuid } = useParams()
    const currentUser = useAppSelector(getCurrentUser)

    const [searchResult, setSearchResult] = useState<ConversationModel[]>([])
    const [searchValue, setSearchValue] = useState('')
    const debounceValue = useDebounce(searchValue)

    useEffect(() => {
        if (debounceValue) {
            // search conversation
            ;(async () => {
                try {
                    const response = await conversationService.searchConversation({ q: debounceValue })
                    if (response) {
                        setSearchResult(response.data)
                    }
                } catch (error) {
                    if (error instanceof AxiosError) {
                        if (error.response?.status === 422) {
                            toast.error(error.response?.data.message)
                        }
                    }
                }
            })()
        }
    }, [debounceValue])

    const renderResult = () => {
        return (
            // 20px: padding left and right
            <div className="h-[calc(100dvh-210px)] w-[calc(100vw-20px)] [overflow:overlay] dark:bg-dark sm:h-[calc(100dvh-180px)] bp900:w-[calc(var(--sidebar-width-tablet)-20px)] lg:w-[calc(var(--sidebar-width)-20px)]">
                {searchResult.map((conversation) => {
                    let conversationMember = conversation.members.find(
                        (member) => member.user_id !== currentUser?.data.id,
                    )

                    return (
                        <Link
                            href={`${config.routes.message}/${conversation.uuid}`}
                            key={conversation.id}
                            className="mt-4 flex items-center gap-2"
                        >
                            <UserAvatar
                                src={conversation.is_group ? conversation.avatar : conversationMember?.user.avatar}
                                size={40}
                            />
                            <div>
                                <p>
                                    {conversation.is_group
                                        ? conversation.name
                                        : conversationMember?.nickname || conversationMember?.user.full_name}
                                </p>
                            </div>
                        </Link>
                    )
                })}
            </div>
        )
    }

    const handleClickOutside = useCallback(() => {
        setSearchMode(false)
        setSearchValue('')
        setSearchResult([])
    }, [setSearchMode, setSearchResult, setSearchValue])

    useEffect(() => {
        if (uuid) {
            handleClickOutside()
        }
    }, [handleClickOutside, uuid])

    return (
        <div>
            <Tippy
                interactive
                visible={searchMode}
                placement="bottom-start"
                render={renderResult}
                onClickOutside={handleClickOutside}
            >
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
                            placeholder="Tìm kiếm đoạn chat"
                            className="w-full bg-transparent px-3 py-2 outline-none"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onFocus={() => setSearchMode(true)}
                        />
                    </div>
                </div>
            </Tippy>
        </div>
    )
}

export default Search
