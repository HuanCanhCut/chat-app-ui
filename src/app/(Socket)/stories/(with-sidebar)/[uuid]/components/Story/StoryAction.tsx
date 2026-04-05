import { useRef, useState } from 'react'
import { EmojiClickData } from 'emoji-picker-react'
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

const iconMapping = baseReactionMapping(36)

const StoryAction: React.FC<StoryActionProps> = ({ story }) => {
    const inputRef = useRef<HTMLInputElement>(null)

    const [isFocused, setIsFocused] = useState(false)
    const [isOpenEmoji, setIsOpenEmoji] = useState(false)

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

    return (
        <div className="flex w-full max-w-dvw items-center gap-3 overflow-x-scroll px-3 pt-3 pb-1 sm:justify-center">
            <div className="relative">
                <input
                    ref={inputRef}
                    className={cn(
                        'w-[300px] max-w-full rounded-3xl border border-white p-2 px-4 placeholder-white transition-all duration-200 ease-linear outline-none dark:border-white',
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
                    <div key={key} className="cursor-pointer">
                        {value}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default StoryAction
