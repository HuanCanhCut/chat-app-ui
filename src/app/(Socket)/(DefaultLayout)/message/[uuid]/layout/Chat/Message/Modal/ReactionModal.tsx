import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons'
import useSWR from 'swr'

import * as messageServices from '~/services/messageService'
import PopperWrapper from '~/components/PopperWrapper'
import Button from '~/components/Button'
import SWRKey from '~/enum/SWRKey'
import { useEffect, useMemo, useState } from 'react'
import config from '~/config'
import UserAvatar from '~/components/UserAvatar'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import { MessageReactionModel } from '~/type/type'
import { useParams, useRouter } from 'next/navigation'
import InfiniteScroll from 'react-infinite-scroll-component'
import socket from '~/helpers/socket'
import { SocketEvent } from '~/enum/SocketEvent'

interface Props {
    onClose: () => void
    messageId: number
}

const PER_PAGE = 7

const ReactionModal: React.FC<Props> = ({ onClose, messageId }) => {
    const { uuid } = useParams()

    const router = useRouter()

    const currentUser = useAppSelector(getCurrentUser)

    const [currentTab, setCurrentTab] = useState('all')
    const [page, setPage] = useState(1)

    const { data: reactionTypes, mutate: mutateReactionTypes } = useSWR(
        messageId ? [SWRKey.GET_REACTIONS, messageId] : null,
        () => {
            return messageServices.getReactionTypes({ messageId })
        },
        {
            revalidateOnMount: true,
        },
    )

    const { data: reactions, mutate: mutateReactions } = useSWR(
        currentTab ? [SWRKey.GET_REACTIONS, currentTab] : null,
        () => {
            return messageServices.getReactions({ messageId, type: currentTab, page, per_page: PER_PAGE })
        },
        {
            revalidateOnMount: true,
        },
    )

    const tabs = useMemo(() => {
        return [
            {
                type: 'all',
                label: 'Tất cả',
                count: reactionTypes?.reduce((acc, reaction) => acc + reaction.count, 0),
            },
            ...(reactionTypes
                ?.filter((reaction) => reaction.count > 0)
                .map((reaction) => ({
                    type: reaction.react,
                    label: reaction.react,
                    count: reaction.count,
                })) || []),
        ]
    }, [reactionTypes])

    const handleChangeReaction = (type: string) => {
        setCurrentTab(type)
        setPage(1)
    }

    const handleChooseReaction = (reaction: MessageReactionModel) => {
        if (reaction.user_id === currentUser?.data.id) {
            socket.emit(SocketEvent.REMOVE_REACTION, {
                message_id: messageId,
                user_reaction_id: currentUser.data.id,
                conversation_uuid: uuid,
                react: reaction.react,
            })
        } else {
            router.push(`${config.routes.user}/@${reaction.user_reaction.nickname}`)
        }
    }

    useEffect(() => {
        const getMoreReactions = async () => {
            if (page > 1) {
                const newReactions = await messageServices.getReactions({
                    messageId,
                    type: currentTab,
                    page,
                    per_page: PER_PAGE,
                })

                if (newReactions && reactions?.meta) {
                    const newReactionsMutate = {
                        data: [...(reactions?.data || []), ...(newReactions.data || [])],
                        meta: {
                            pagination: {
                                ...reactions.meta.pagination,
                                current_page: page,
                            },
                        },
                    }

                    mutateReactions(newReactionsMutate, {
                        revalidate: false,
                    })
                }
            }
        }

        getMoreReactions()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messageId, mutateReactions, page])

    useEffect(() => {
        socket.on(SocketEvent.REMOVE_REACTION, (data) => {
            if (!reactions?.data) {
                return
            }

            if (data.message_id === messageId) {
                const newReactions = reactions?.data.filter((reaction) => reaction.user_id !== currentUser.data.id)

                const newReactionTypes = reactionTypes?.map((reaction) => {
                    if (reaction.react === data.react) {
                        return {
                            ...reaction,
                            count: reaction.count - 1,
                        }
                    }

                    return reaction
                })

                mutateReactionTypes(newReactionTypes, {
                    revalidate: false,
                })

                mutateReactions(
                    {
                        data: newReactions,
                        meta: reactions?.meta,
                    },
                    {
                        revalidate: false,
                    },
                )
            }
        })
    }, [currentUser.data.id, messageId, mutateReactionTypes, mutateReactions, reactionTypes, reactions])

    return (
        <PopperWrapper className="w-[548px] max-w-[calc(100vw-40px)] !p-0">
            <header className="relative flex justify-center border-b border-gray-300 p-4 dark:border-zinc-700">
                <h3>Cảm xúc về tin nhắn</h3>
                <Button buttonType="icon" onClick={onClose} className="absolute right-2 top-1/2 -translate-y-1/2">
                    <FontAwesomeIcon icon={faXmark} className="text-xl" />
                </Button>
            </header>
            <main className="p-4">
                <div>
                    {tabs.map((tab) => (
                        <button
                            key={tab.type}
                            className={`h-[60px] px-4 font-medium ${tab.type !== 'all' ? 'text-xl' : ''} ${
                                currentTab === tab.type
                                    ? 'border-b-[3px] border-primary text-primary'
                                    : 'rounded-lg border-b-[3px] border-transparent text-zinc-800 hover:bg-[#99999936] dark:text-zinc-400 dark:hover:bg-[#3e4141]'
                            }`}
                            onClick={() => handleChangeReaction(tab.type)}
                        >
                            {tab.label}
                            {!!tab.count && <span className={`ml-1 text-sm`}>{tab.count}</span>}
                        </button>
                    ))}
                </div>
                <div className="mt-2 max-h-[200px] overflow-y-auto" id="reaction-scrollable">
                    <InfiniteScroll
                        dataLength={reactions?.data.length || 0} //This is important field to render the next data
                        next={() => {
                            setPage(page + 1)
                        }}
                        className="!overflow-hidden"
                        hasMore={
                            reactions && reactions?.meta.pagination.current_page < reactions?.meta.pagination.total_pages ? true : false
                        }
                        scrollThreshold={0.8}
                        loader={
                            <div className="flex justify-center">
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            </div>
                        }
                        scrollableTarget="reaction-scrollable"
                    >
                        {reactions?.data.map((reaction, index) => {
                            return (
                                <div
                                    key={index}
                                    className="flex cursor-pointer items-center p-2"
                                    onClick={() => handleChooseReaction(reaction)}
                                >
                                    <UserAvatar size={40} src={reaction.user_reaction.avatar} />
                                    <div className="ml-2 flex-grow">
                                        <p>{reaction.user_reaction.full_name}</p>
                                        <p className="text-xs font-light text-zinc-600 dark:text-zinc-400">
                                            {reaction.user_id === currentUser?.data.id ? 'Nhấp để gỡ bỏ' : 'Nhấp để xem trang cá nhân'}
                                        </p>
                                    </div>
                                    <p className="text-2xl">{reaction.react}</p>
                                </div>
                            )
                        })}
                    </InfiniteScroll>
                </div>
            </main>
        </PopperWrapper>
    )
}

export default ReactionModal
