import React from 'react'
import Link from 'next/link'
import Tippy from 'huanpenguin-tippy-react'
import { Ellipsis } from 'lucide-react'
import moment from 'moment-timezone'
import { KeyedMutator } from 'swr'

import BaseReaction from '~/components/BaseReaction'
import { reactionNameMapping } from '~/components/BaseReaction/BaseReaction'
import TopReactions from '~/components/TopReactions'
import { Button } from '~/components/ui/button'
import UserAvatar from '~/components/UserAvatar'
import config from '~/config'
import handleApiError from '~/helpers/handleApiError'
import { cn } from '~/lib/utils'
import * as commentServices from '~/services/commentService'
import { CommentResponse } from '~/type/comment'
import { ResponseCursorPagination } from '~/type/common.type'
import { BaseReactionUnified } from '~/type/reaction.type'
import { momentTimezone } from '~/utils/moment'

interface CommentItemProps extends React.ComponentProps<'div'> {
    comment: CommentResponse
    mutateComments: KeyedMutator<ResponseCursorPagination<CommentResponse[]>>
    className?: string
    level?: number
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, mutateComments, className = '', level = 0, ...props }) => {
    const formatTime = (dateTime: Date): string => {
        const date = moment(dateTime)
        const now = moment()

        if (date.isSame(now, 'day')) {
            return moment(date).fromNow()
        }

        if (date.isSame(now.subtract(1, 'day'), 'day')) {
            return `Hôm qua lúc ${date.format('HH:mm')}`
        }

        return date.format('DD [tháng] MM, YYYY [lúc] HH:mm')
    }

    /**
     *
     * @param unified: react comment
     * @param undefined: unreact comment
     */

    const handleReaction = async (unified?: BaseReactionUnified | undefined) => {
        try {
            mutateComments(
                (prev: ResponseCursorPagination<CommentResponse[]> | undefined) => {
                    if (!prev) return prev

                    const reactionCount = (unified?: BaseReactionUnified | undefined) => {
                        if (unified) {
                            if (!comment.react) {
                                return comment.reaction_count + 1
                            }
                            return comment.reaction_count
                        }
                        return comment.reaction_count - 1
                    }

                    return {
                        ...prev,
                        data: prev.data.map((item) => {
                            if (item.id === comment.id) {
                                return {
                                    ...item,
                                    reaction_count: reactionCount(unified),
                                    react: unified ?? null,
                                }
                            }
                            return item
                        }),
                    }
                },
                {
                    revalidate: false,
                },
            )

            if (unified) {
                await commentServices.reactComment({
                    commentId: comment.id,
                    unified,
                })
            } else {
                await commentServices.unreactComment({
                    commentId: comment.id,
                })
            }

            const commentResponse = await commentServices.getCommentById({ commentId: comment.id })

            mutateComments(
                (prev: ResponseCursorPagination<CommentResponse[]> | undefined) => {
                    if (!prev) return prev

                    return {
                        ...prev,
                        data: prev.data.map((item) => {
                            if (item.id === comment.id) {
                                return {
                                    ...item,
                                    top_reactions: commentResponse.data.top_reactions,
                                    react: commentResponse.data.react,
                                }
                            }
                            return item
                        }),
                    }
                },
                {
                    revalidate: false,
                },
            )
        } catch (error) {
            handleApiError(error)
        }
    }

    const handleLoadReplies = async () => {
        try {
            const repliesComment = await commentServices.getPostComments({
                postId: comment.post_id,
                limit: 10,
                parentId: comment.id,
            })

            mutateComments(
                (prev: ResponseCursorPagination<CommentResponse[]> | undefined) => {
                    if (!prev) return prev

                    return {
                        ...prev,
                        data: prev.data.map((item) => {
                            if (item.id === comment.id) {
                                return {
                                    ...item,
                                    replies: repliesComment.data,
                                }
                            }
                            return item
                        }),
                    }
                },
                {
                    revalidate: false,
                },
            )
        } catch (error) {
            handleApiError(error)
        }
    }

    return (
        <div
            className={cn('relative flex items-start py-1', className)}
            {...props}
            style={{
                marginLeft: `${level * 10}px`,
            }}
        >
            {level > 0 && (
                <div className="absolute top-0 -left-[26.5px] h-6 w-6 rounded-bl-xl border-b-2 border-l-2 border-zinc-500 dark:border-zinc-600"></div>
            )}

            <div className="relative flex flex-col items-center self-stretch">
                <Link href={`${config.routes.user}/@${comment.user.nickname}`}>
                    <UserAvatar src={comment.user.avatar} size={32} />
                </Link>

                {/* Comment line */}
                {comment.reply_count > 0 && (
                    <div className="absolute top-[40px] bottom-6 left-0 w-[calc(50%+1px)] border-r-2 border-zinc-500 dark:border-zinc-600" />
                )}
            </div>

            <div>
                <div className="ml-3 flex items-center gap-1">
                    <div className="dark:bg-dark-gray bg-light-gray rounded-2xl px-3 py-2 text-wrap">
                        <Link href={`${config.routes.user}/@${comment.user.nickname}`}>
                            <p className="text-mutated-for cursor-pointer text-sm font-medium hover:underline">
                                {comment.user.full_name}
                            </p>
                        </Link>

                        <p className="text-[15px]">{comment.content}</p>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="transition- rounded-full bg-transparent opacity-0 dark:bg-transparent"
                    >
                        <Ellipsis />
                    </Button>
                </div>
                <div className="mt-1 ml-4 flex items-center gap-3">
                    <Tippy content={formatTime(comment.created_at)}>
                        <p className="text-mutated-for text-muted-foreground cursor-pointer text-xs font-medium select-none hover:underline">
                            {momentTimezone(comment.created_at)}
                        </p>
                    </Tippy>

                    <BaseReaction handleReaction={handleReaction}>
                        <p
                            className="text-mutated-for text-muted-foreground cursor-pointer text-xs font-semibold select-none hover:underline"
                            style={{
                                color: comment.react
                                    ? `var(--reaction-${reactionNameMapping[comment.react].type})`
                                    : undefined,
                            }}
                            onClick={() => handleReaction(comment.react ? undefined : '1f44d')}
                        >
                            {comment.react ? reactionNameMapping[comment.react].name : 'Thích'}
                        </p>
                    </BaseReaction>

                    <p className="text-mutated-for text-muted-foreground cursor-pointer text-xs font-medium select-none hover:underline">
                        Trả lời
                    </p>

                    {comment.top_reactions && (
                        <TopReactions
                            topReactions={comment.top_reactions}
                            reactionCount={comment.reaction_count}
                            reactionableType="Comment"
                            className="flex-row-reverse"
                        />
                    )}
                </div>

                {comment.reply_count > 0 && comment.reply_count > (comment.replies?.length || 0) && (
                    <div className="mt-1 flex items-center gap-1.5">
                        <div className="absolute bottom-3 left-[15.5px] flex h-4 w-7 flex-col self-stretch rounded-bl-xl border-t-0 border-b-2 border-l-2 border-zinc-500 bg-transparent select-none dark:border-zinc-600"></div>
                        <p
                            className="text-mutated-for text-muted-foreground ml-4 cursor-pointer text-sm font-medium select-none hover:underline"
                            onClick={handleLoadReplies}
                        >
                            Xem thêm {comment.reply_count - (comment.replies?.length || 0)} trả lời
                        </p>
                    </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                    <>
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                mutateComments={mutateComments}
                                level={level + 1}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}

export default CommentItem
