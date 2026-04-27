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
import { UserModel } from '~/type/user.type'

interface CommentComposerProps {
    post: PostResponse
    level?: number
    parentCommentId?: number
    replyUser?: UserModel
}

const CommentComposer: React.FC<CommentComposerProps> = ({ post, level = 0, parentCommentId = 0, replyUser }) => {
    const currentUser = useAppSelector(selectCurrentUser)

    const containerRef = useRef<HTMLDivElement | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)

    const [emojiOpen, setEmojiOpen] = useState<boolean>(false)
    const [mentionTag, setMentionTag] = useState<string>(() => {
        if (replyUser) {
            return `@${replyUser.full_name}`
        }

        return ''
    })
    const [value, setValue] = useState<string>('')
    const [isShowActions, setIsShowActions] = useState(() => {
        if (replyUser) {
            return true
        }

        return false
    })

    const handleToggleEmoji = () => {
        setEmojiOpen((prev) => !prev)
    }

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setValue((prev) => prev + emojiData.emoji)
    }

    const handleRemoveMention = () => {
        setMentionTag('')
        textareaRef.current?.focus()
    }

    const handleCreateComment = async () => {
        const content = mentionTag ? `${mentionTag} ${value}`.trim() : value.trim()

        if (!content) return

        try {
            const commentResponse = await commentService.createComment({
                content,
                postId: post.id,
                parentId: parentCommentId,
            })

            sendEvent('COMMENT:NEW', {
                comment: commentResponse.data,
            })

            setValue('')
            setMentionTag('')
        } catch (error) {
            handleApiError(error)
        }
    }

    const handleKeydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleCreateComment()
        }

        // Backspace khi textarea rỗng thì xóa mention
        if (e.key === 'Backspace' && value === '' && mentionTag) {
            e.preventDefault()
            handleRemoveMention()
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
                        'absolute top-0 left-[-16.5px] h-6 w-8 rounded-bl-lg border-b-2 border-l-2 border-zinc-500 bg-transparent select-none dark:border-zinc-600',
                        {
                            'top-6 h-4': !!isShowActions,
                        },
                    )}
                />
            )}

            <UserAvatar
                src={currentUser?.data.avatar}
                className={cn('size-8', {
                    'size-6': !!parentCommentId,
                })}
            />

            <div className="bg-white-gray dark:bg-dark-gray flex-1 overflow-hidden rounded-2xl py-2 pb-0">
                {/* Mention tag + Textarea trong cùng 1 row */}
                <div className="flex flex-wrap items-center gap-1 px-3 pb-1">
                    {mentionTag && (
                        <span
                            className="-mt-[3px] inline-flex cursor-pointer items-center gap-1 rounded-md bg-blue-100 px-1.5 py-0.5 pt-0 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-900/60"
                            onClick={handleRemoveMention}
                        >
                            {mentionTag}
                            <span className="text-blue-400 dark:text-blue-500">×</span>
                        </span>
                    )}

                    <Textarea
                        ref={textareaRef}
                        className="bg-white-gray dark:bg-dark-gray min-h-5 flex-1 resize-none rounded-none border-none p-0 pb-1 text-base shadow-none focus-visible:border-none focus-visible:ring-0 dark:border-none dark:shadow-none"
                        placeholder={
                            mentionTag
                                ? 'Nhập bình luận...'
                                : parentCommentId
                                  ? `Trả lời ${post.user.full_name}...`
                                  : 'Viết bình luận ...'
                        }
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeydown}
                        onFocus={() => setIsShowActions(true)}
                    />
                </div>

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
                        render={() => (
                            <div tabIndex={-1}>
                                <Emoji onEmojiClick={handleEmojiClick} isOpen={emojiOpen} />
                            </div>
                        )}
                        onClickOutside={() => setEmojiOpen(false)}
                        placement="top-start"
                        offset={[0, 40]}
                        interactive
                        visible={emojiOpen}
                        appendTo={document.body}
                    >
                        <Tippy content="Chọn biểu tượng cảm xúc">
                            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleToggleEmoji}>
                                <Smile className="size-4" />
                            </Button>
                        </Tippy>
                    </HeadlessTippy>

                    <Tippy content="Bình luận">
                        <Button variant="ghost" size="icon" className="rounded-full" onClick={handleCreateComment}>
                            <Send className="size-4" />
                        </Button>
                    </Tippy>
                </div>
            </div>
        </div>
    )
}

export default CommentComposer
