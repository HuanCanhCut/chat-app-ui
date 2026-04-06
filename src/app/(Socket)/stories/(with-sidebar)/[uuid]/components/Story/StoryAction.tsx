import React, { useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { EmojiClickData } from 'emoji-picker-react'
import { motion } from 'framer-motion'
import Tippy from 'huanpenguin-tippy-react'
import HeadlessTippy from 'huanpenguin-tippy-react/headless'
import { Send, Smile } from 'lucide-react'

import baseReactionMapping from '~/common/baseReactionIcon'
import Emoji from '~/components/Emoji'
import { cn } from '~/lib/utils'
import { StoryModel } from '~/type/story.type'

interface StoryActionProps {
    story: StoryModel
}

interface FloatingReaction {
    id: string
    emoji: React.ReactNode
    x: number
    y: number
    initX: number
    initY: number
}

const iconMapping = baseReactionMapping(36)

const FLOATING_DURATION = 1800

const StoryAction: React.FC<StoryActionProps> = ({ story }) => {
    const inputRef = useRef<HTMLInputElement>(null)

    const [isFocused, setIsFocused] = useState(false)
    const [isOpenEmoji, setIsOpenEmoji] = useState(false)
    const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([])

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        //
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            e.preventDefault()
            e.currentTarget.blur()
            setIsFocused(false)
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

    const handleReaction = ({
        unified,
        emoji,
        initPosition,
    }: {
        unified: keyof typeof iconMapping
        emoji: React.ReactNode
        initPosition: { x: number; y: number }
    }) => {
        handleFloatingReaction({ emoji, initPosition })
    }

    return (
        <div className="flex w-full max-w-dvw items-center gap-3 overflow-x-scroll px-3 pt-3 pb-1 sm:justify-center">
            <div className="relative">
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
                />
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
                        <button
                            className="cursor-pointer"
                            onMouseDown={(e) => {
                                e.preventDefault()
                            }}
                        >
                            <Send />
                        </button>
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
                                unified: key as keyof typeof iconMapping,
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
