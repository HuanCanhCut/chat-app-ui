import { useState } from 'react'
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

    const [emojiOpen, setEmojiOpen] = useState<boolean>(false)
    const [value, setValue] = useState<string>('')

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

    return (
        <div className="flex w-full items-center gap-3 py-4">
            <UserAvatar
                src={currentUser?.data.avatar}
                className={cn('size-8', {
                    'size-6': !!parentCommentId,
                })}
            />

            <div className="bg-white-gray dark:bg-dark-gray flex-1 rounded-2xl p-3 px-0 pb-1">
                <Textarea
                    className="bg-white-gray dark:bg-dark-gray min-h-5 w-full resize-none rounded-none border-none p-0 px-3 pb-3 text-base shadow-none focus-visible:border-none focus-visible:ring-0 dark:border-none dark:shadow-none"
                    placeholder={parentCommentId ? `Trả lời ${post.user.full_name}...` : 'Viết bình luận ...'}
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value)
                    }}
                    onKeyDown={handleKeydown}
                />

                <div className="text-muted-foreground flex w-full justify-between px-1">
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
