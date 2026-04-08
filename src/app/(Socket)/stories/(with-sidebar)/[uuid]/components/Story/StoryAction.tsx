import React, { useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { EmojiClickData } from 'emoji-picker-react'
import { motion } from 'framer-motion'
import Tippy from 'huanpenguin-tippy-react'
import HeadlessTippy from 'huanpenguin-tippy-react/headless'
import { Send, Smile } from 'lucide-react'

import baseReactionMapping from '~/common/baseReactionIcon'
import Emoji from '~/components/Emoji'
import socket from '~/helpers/socket'
import { cn } from '~/lib/utils'
import { selectCurrentUser } from '~/redux/selector'
import { useAppSelector } from '~/redux/types'
import * as conversationServices from '~/services/conversationService'
import * as storyServices from '~/services/storyService'
import { BaseReactionUnified, ReactionModel } from '~/type/reaction.type'
import { StoryModel } from '~/type/story.type'

const iconMapping = baseReactionMapping(36)

const FLOATING_DURATION = 1800
interface FloatingReaction {
    id: string
    emoji: React.ReactNode
    x: number
    y: number
    initX: number
    initY: number
}

interface StoryActionProps {
    story: StoryModel
    handleReactStory: (reactions: ReactionModel[]) => void
    conversation_uuid?: string
}

const StoryAction: React.FC<StoryActionProps> = ({ story, handleReactStory, conversation_uuid }) => {
    const currentUser = useAppSelector(selectCurrentUser)

    const inputRef = useRef<HTMLInputElement>(null)

    const [isFocused, setIsFocused] = useState(false)
    const [isOpenEmoji, setIsOpenEmoji] = useState(false)
    const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([])
    const [message, setMessage] = useState('')

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setMessage((prev) => prev + emojiData.emoji)
    }

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'Enter':
                e.preventDefault()
                await handleEmitMessage()
                break
            case 'Escape':
                e.preventDefault()
                e.currentTarget.blur()
                setIsFocused(false)
                break
        }
    }

    const handleFloatingReaction = ({
        emoji,
        initPosition,
    }: {
        emoji: React.ReactNode
        initPosition: { x: number; y: number }
    }) => {
        const id = Date.now().toString() + Math.random()

        const reaction: FloatingReaction = {
            id,
            emoji,
            x: initPosition.x + (Math.random() - 0.5) * 200,
            y: initPosition.y - 200 - Math.random() * 100, // min 200, max 300
            initX: initPosition.x,
            initY: initPosition.y,
        }

        setFloatingReactions((prev) => [...prev, reaction])

        setTimeout(() => {
            setFloatingReactions((prev) => prev.filter((reaction) => reaction.id !== id))
        }, FLOATING_DURATION + 200)
    }

    const handleReaction = async ({
        unified,
        emoji,
        initPosition,
    }: {
        unified: BaseReactionUnified
        emoji: React.ReactNode
        initPosition: { x: number; y: number }
    }) => {
        handleFloatingReaction({ emoji, initPosition })

        const response = await storyServices.reactStory(story.uuid, unified)

        handleReactStory(response.data)
    }

    const handleEmitMessage = async () => {
        const onlyIcon = new RegExp(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base})+$/u).test(
            message.trim() as string,
        )

        if (!conversation_uuid) {
            // create temp conversation
            const conversation = await conversationServices.createTempConversation({ userId: story.user_id })

            conversation_uuid = conversation.data.uuid
        }

        if (conversation_uuid) {
            socket.emit('NEW_MESSAGE', {
                conversation_uuid,
                message: message,
                type: onlyIcon ? 'icon' : 'text',
                forward_type: 'Story',
                forward_origin_id: story.id,
            })

            setMessage('')
            setIsFocused(false)
        }
    }

    return (
        <div className="flex w-full max-w-dvw items-center gap-3 overflow-x-scroll overflow-y-hidden px-3 pt-3 pb-1 sm:justify-center">
            <div className="relative">
                {story.user_id !== currentUser?.data.id && (
                    <input
                        ref={inputRef}
                        className={cn(
                            'w-[300px] max-w-full rounded-3xl border border-white p-2 px-4 placeholder-white transition-all duration-200 ease-linear outline-none select-none dark:border-white',
                            isFocused && 'w-[600px]',
                        )}
                        onFocus={() => {
                            setIsFocused(true)
                        }}
                        onBlur={() => {
                            if (!isOpenEmoji) {
                                setIsFocused(false)
                            }
                        }}
                        placeholder="Gửi tin nhắn..."
                        onKeyDown={handleKeyDown}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                )}
                {isFocused && (
                    <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2">
                        <HeadlessTippy
                            interactive
                            appendTo={() => document.body}
                            render={() => {
                                return <Emoji onEmojiClick={handleEmojiClick} isOpen={isOpenEmoji} />
                            }}
                            visible={isOpenEmoji}
                            onClickOutside={() => {
                                // don't change this line to blur, i don't know why but it's not working :)
                                inputRef.current?.focus()
                                setIsOpenEmoji(false)
                            }}
                        >
                            <div>
                                <Tippy content="Biểu tượng cảm xúc">
                                    <button
                                        className="flex-center cursor-pointer"
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                        }}
                                        onClick={() => {
                                            setIsOpenEmoji((prev) => !prev)
                                        }}
                                    >
                                        <Smile />
                                    </button>
                                </Tippy>
                            </div>
                        </HeadlessTippy>
                        <Tippy content="Gửi">
                            <button
                                className="cursor-pointer"
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                }}
                                onClick={handleEmitMessage}
                            >
                                <Send />
                            </button>
                        </Tippy>
                    </div>
                )}
            </div>

            <div
                className={cn(
                    'flex w-[300px] items-center gap-2 opacity-100 transition-all duration-200 ease-linear',
                    isFocused && 'w-0 overflow-hidden',
                )}
            >
                {Object.entries(iconMapping).map(([key, value]) => (
                    <div
                        key={key}
                        className="cursor-pointer"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()

                            handleReaction({
                                unified: key as BaseReactionUnified,
                                emoji: value,
                                initPosition: { x: rect.x, y: rect.y },
                            })
                        }}
                    >
                        {value}
                    </div>
                ))}
            </div>

            {/* Append to body to avoid overflow hidden */}
            {ReactDOM.createPortal(
                <div className="pointer-events-none fixed inset-0 z-9999999">
                    {floatingReactions.map((reaction) => (
                        <motion.div
                            key={reaction.id}
                            className="absolute"
                            initial={{ left: reaction.initX, top: reaction.initY, scale: 1, opacity: 1 }}
                            animate={{
                                left: reaction.x,
                                top: reaction.y,
                                scale: [1, 1.4, 1.2],
                                opacity: [1, 1, 0],
                            }}
                            transition={{ duration: FLOATING_DURATION / 1000, ease: 'easeOut' }}
                        >
                            {reaction.emoji}
                        </motion.div>
                    ))}
                </div>,
                document.body,
            )}
        </div>
    )
}

export default StoryAction
