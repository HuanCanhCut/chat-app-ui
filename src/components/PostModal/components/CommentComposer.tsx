import { useRef, useState } from 'react'
import { EmojiClickData } from 'emoji-picker-react'
import Tippy from 'huanpenguin-tippy-react'
import HeadlessTippy from 'huanpenguin-tippy-react/headless'
import { Send, Smile } from 'lucide-react'

import Emoji from '~/components/Emoji'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import UserAvatar from '~/components/UserAvatar'
import { sendEvent } from '~/helpers/events'
import handleApiError from '~/helpers/handleApiError'
import useClickOutside from '~/hooks/useClickOutside'
import { cn } from '~/lib/utils'
import { selectCurrentUser } from '~/redux/selector'
import { useAppSelector } from '~/redux/types'
import * as commentService from '~/services/commentService'
import { PostResponse } from '~/type/post.type'

interface CommentComposerProps {
    post: PostResponse
    level?: number
    parentCommentId?: number
}

const CommentComposer: React.FC<CommentComposerProps> = ({ post, level = 0, parentCommentId = 0 }) => {
    const currentUser = useAppSelector(selectCurrentUser)

    const containerRef = useRef<HTMLDivElement | null>(null)

    const [emojiOpen, setEmojiOpen] = useState<boolean>(false)
    const [value, setValue] = useState<string>('')
    const [isShowActions, setIsShowActions] = useState(false)

    const handleToggleEmoji = () => {
        setEmojiOpen((prev) => {
            return !prev
        })
    }

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setValue((prev) => {
            return prev + emojiData.emoji
        })
    }

    const handleCreateComment = async () => {
        try {
            const commentResponse = await commentService.createComment({
                content: value,
                postId: post.id,
                parentId: parentCommentId,
            })

            sendEvent('COMMENT:NEW', {
                comment: commentResponse.data,
            })

            setValue('')
        } catch (error) {
            handleApiError(error)
        }
    }

    const handleKeydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleCreateComment()
        }
    }

    useClickOutside(containerRef, () => {
        setIsShowActions(false)
    })

    return (
        <div
            className="relative flex w-full items-center gap-3 py-1"
            style={{
                paddingLeft: level && level < 3 ? '20px' : level >= 3 ? '-32px' : '',
            }}
            ref={containerRef}
        >
            {!!parentCommentId && (
                <div
                    className={cn(
                        'bg-red absolute top-0 left-[-16.5px] h-6 w-8 rounded-bl-lg border-b-2 border-l-2 border-zinc-500 bg-transparent select-none dark:border-zinc-600',
                        {
                            'top-6 h-4': !!isShowActions,
                        },
                    )}
                ></div>
            )}
            <UserAvatar
                src={currentUser?.data.avatar}
                className={cn('size-8', {
                    'size-6': !!parentCommentId,
                })}
            />
            <div className="bg-white-gray dark:bg-dark-gray flex-1 overflow-hidden rounded-2xl py-2 pb-0">
                <Textarea
                    className="bg-white-gray dark:bg-dark-gray min-h-5 w-full resize-none rounded-none border-none p-0 px-3 pb-2 text-base shadow-none focus-visible:border-none focus-visible:ring-0 dark:border-none dark:shadow-none"
                    placeholder={parentCommentId ? `Trả lời ${post.user.full_name}...` : 'Viết bình luận ...'}
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value)
                    }}
                    onKeyDown={handleKeydown}
                    onFocus={() => {
                        setIsShowActions(true)
                    }}
                />

                <div
                    className={cn(
                        'text-muted-foreground flex w-full justify-between overflow-hidden px-1 transition-all duration-200 ease-linear',
                        {
                            'max-h-40 opacity-100': isShowActions,
                            'max-h-0 opacity-0': !isShowActions,
                        },
                    )}
                >
                    <HeadlessTippy
                        render={() => {
                            return (
                                <div tabIndex={-1}>
                                    <Emoji onEmojiClick={handleEmojiClick} isOpen={emojiOpen} />
                                </div>
                            )
                        }}
                        onClickOutside={() => setEmojiOpen(false)}
                        placement="top-start"
                        offset={[0, 40]}
                        interactive
                        visible={emojiOpen}
                        appendTo={document.body}
                    >
                        <Tippy content="Chọn biểu tượng cảm xúc">
                            <Button
                                variant={'ghost'}
                                size={'icon'}
                                className="rounded-full"
                                onClick={handleToggleEmoji}
                            >
                                <Smile className="size-4" />
                            </Button>
                        </Tippy>
                    </HeadlessTippy>

                    <Tippy content="Bình luận">
                        <Button variant={'ghost'} size={'icon'} className="rounded-full" onClick={handleCreateComment}>
                            <Send className="size-4" />
                        </Button>
                    </Tippy>
                </div>
            </div>
        </div>
    )
}

export default CommentComposer
