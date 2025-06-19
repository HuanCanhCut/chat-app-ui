import Tippy from '@tippyjs/react'
import { MessageModel, TopReaction, MessageReactionModel, MessageResponse } from '~/type/type'
import { Emoji, EmojiStyle } from 'emoji-picker-react'
import { useEffect } from 'react'
import socket from '~/helpers/socket'
import { SocketEvent } from '~/enum/SocketEvent'
import { mutate } from 'swr'
import SWRKey from '~/enum/SWRKey'
import { useParams } from 'next/navigation'
interface ReactionProps {
    message: MessageModel
    // eslint-disable-next-line no-unused-vars
    handleOpenReactionModal: (messageId: number) => void
}

const Reaction = ({ message, handleOpenReactionModal }: ReactionProps) => {
    const { uuid } = useParams()

    useEffect(() => {
        interface ReactionMessage {
            reaction: MessageReactionModel
            total_reactions: number
            top_reactions: TopReaction[]
        }
        const socketHandler = (data: ReactionMessage) => {
            if (message.id !== data.reaction.message_id) {
                return
            }

            mutate(
                [SWRKey.GET_MESSAGES, uuid],
                (prev: MessageResponse | undefined) => {
                    if (!prev) {
                        return prev
                    }

                    if (!prev.data) {
                        return prev
                    }

                    const newMessages = prev.data.map((message) => {
                        if (message.id === data.reaction.message_id) {
                            return {
                                ...message,
                                top_reactions: data.top_reactions,
                                total_reactions: data.total_reactions,
                            }
                        }

                        return message
                    })

                    return {
                        data: newMessages,
                        meta: prev.meta,
                    }
                },
                {
                    revalidate: false,
                },
            )
        }

        socket.on(SocketEvent.REACT_MESSAGE, socketHandler)

        return () => {
            socket.off(SocketEvent.REACT_MESSAGE, socketHandler)
        }
    }, [message.id, uuid])

    useEffect(() => {
        interface RemoveReactionMessage {
            message_id: number
            total_reactions: number
            top_reactions: TopReaction[]
        }

        const socketHandler = (data: RemoveReactionMessage) => {
            if (message.id !== data.message_id) {
                return
            }

            mutate(
                [SWRKey.GET_MESSAGES, uuid],
                (prev: MessageResponse | undefined) => {
                    if (!prev) {
                        return prev
                    }

                    const newMessages = prev.data.map((message) => {
                        if (message.id === data.message_id) {
                            return {
                                ...message,
                                top_reactions: data.top_reactions,
                                total_reactions: data.total_reactions,
                            }
                        }
                        return message
                    })

                    return {
                        data: newMessages,
                        meta: prev.meta,
                    }
                },
                {
                    revalidate: false,
                },
            )
        }

        socket.on(SocketEvent.REMOVE_REACTION, socketHandler)

        return () => {
            socket.off(SocketEvent.REMOVE_REACTION, socketHandler)
        }
    }, [message.id, uuid])

    return message.top_reactions && message.top_reactions.length !== 0 ? (
        <Tippy
            content={
                <div>
                    {message?.top_reactions?.map((reaction, index) => {
                        return (
                            <p className="font-light leading-5" key={index}>
                                {reaction.user_reaction.full_name}
                            </p>
                        )
                    })}

                    {message?.total_reactions > 2 && (
                        <p className="font-light leading-5">và {message?.total_reactions - 2} người khác...</p>
                    )}
                </div>
            }
        >
            <div
                className="absolute bottom-[-10px] right-1 flex cursor-pointer items-center rounded-full bg-white py-[2px] shadow-sm shadow-zinc-300 dark:bg-zinc-800 dark:shadow-zinc-700"
                onClick={() => {
                    handleOpenReactionModal(message.id)
                }}
            >
                {message?.top_reactions?.map((reaction, index) => {
                    return (
                        <span className="ml-[2px] text-sm leading-none" key={index}>
                            <Emoji unified={reaction.react} size={14} emojiStyle={EmojiStyle.FACEBOOK} />
                        </span>
                    )
                })}
                {message?.total_reactions !== 0 && (
                    <span className="mx-1 text-xs leading-none text-gray-500 dark:text-zinc-400">
                        {message?.total_reactions}
                    </span>
                )}
            </div>
        </Tippy>
    ) : null
}

export default Reaction
