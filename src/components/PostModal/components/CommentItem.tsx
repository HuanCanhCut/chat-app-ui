import React from 'react'
import Link from 'next/link'
import Tippy from 'huanpenguin-tippy-react'
import moment from 'moment-timezone'
import { KeyedMutator } from 'swr'

import CommentActions from './CommentActions'
import CommentComposer from './CommentComposer'
import BaseReaction from '~/components/BaseReaction'
import { reactionNameMapping } from '~/components/BaseReaction/BaseReaction'
import TopReactions from '~/components/TopReactions'
import UserAvatar from '~/components/UserAvatar'
import config from '~/config'
import handleApiError from '~/helpers/handleApiError'
import { cn } from '~/lib/utils'
import { selectCurrentUser } from '~/redux/selector'
import { useAppSelector } from '~/redux/types'
import * as commentServices from '~/services/commentService'
import { CommentResponse } from '~/type/comment'
import { ResponseCursorPagination } from '~/type/common.type'
import { PostResponse } from '~/type/post.type'
import { BaseReactionUnified } from '~/type/reaction.type'
import { momentTimezone } from '~/utils/moment'

interface CommentItemProps extends React.ComponentProps<'div'> {
    comment: CommentResponse
    post: PostResponse
    mutateComments: KeyedMutator<ResponseCursorPagination<CommentResponse[]>>
    className?: string
    level?: number
}

const CommentItem: React.FC<CommentItemProps> = ({
    comment,
    post,
    mutateComments,
    className = '',
    level = 0,
    ...props
}) => {
    const currentUser = useAppSelector(selectCurrentUser)
    const [isReplying, setIsReplying] = React.useState(false)

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

                    const updateReaction = (comments: CommentResponse[]): CommentResponse[] => {
                        return comments.map((item) => {
                            if (item.id === comment.id) {
                                return {
                                    ...item,
                                    reaction_count: reactionCount(unified),
                                    react: unified ?? null,
                                }
                            }

                            // Recursive update nested replies
                            if (item.replies && item.replies.length > 0) {
                                return {
                                    ...item,
                                    replies: updateReaction(item.replies),
                                }
                            }

                            return item
                        })
                    }

                    return {
                        ...prev,
                        data: updateReaction(prev.data),
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

                    const updateFinalReaction = (comments: CommentResponse[]): CommentResponse[] => {
                        return comments.map((item) => {
                            if (item.id === comment.id) {
                                return {
                                    ...item,
                                    top_reactions: commentResponse.data.top_reactions,
                                    react: commentResponse.data.react,
                                }
                            }

                            if (item.replies && item.replies.length > 0) {
                                return {
                                    ...item,
                                    replies: updateFinalReaction(item.replies),
                                }
                            }

                            return item
                        })
                    }

                    return {
                        ...prev,
                        data: updateFinalReaction(prev.data),
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
            const { data: repliesComment } = await commentServices.getPostComments({
                postId: comment.post_id,
                limit: 10,
                parentId: comment.id,
            })

            mutateComments(
                (prev: ResponseCursorPagination<CommentResponse[]> | undefined) => {
                    if (!prev) return prev

                    const addReplies = (comments: CommentResponse[], replies: CommentResponse[]): CommentResponse[] => {
                        return comments.map((cmt) => {
                            if (cmt.id === comment.id) {
                                return {
                                    ...cmt,
                                    replies: [...replies, ...(cmt.replies || [])],
                                }
                            }

                            if (cmt.replies && cmt.replies.length > 0) {
                                return { ...cmt, replies: addReplies(cmt.replies, replies) }
                            }

                            return cmt
                        })
                    }

                    return {
                        ...prev,
                        data: addReplies(prev.data, repliesComment),
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
                marginLeft: level && level < 3 ? '20px' : level >= 3 ? '-32px' : '',
            }}
        >
            {level > 0 && (
                <div className="absolute top-0 -left-[36.5px] h-5 w-7 rounded-bl-lg border-b-2 border-l-2 border-zinc-500 dark:border-zinc-600"></div>
            )}

            <div className="relative flex flex-col items-center self-stretch">
                <Link href={`${config.routes.user}/@${comment.user.nickname}`}>
                    <UserAvatar src={comment.user.avatar} size={32} />
                </Link>

                {/* Comment line */}
                {((comment.reply_count > 0 && level < 2) || isReplying) && (
                    <div className="absolute top-[40px] bottom-11 left-0 w-[calc(50%+1px)] border-r-2 border-zinc-500 dark:border-zinc-600" />
                )}
            </div>

            <div className="w-full">
                <div className="group ml-3 flex items-center gap-1">
                    <div className="dark:bg-dark-gray bg-light-gray rounded-2xl px-3 py-2 text-wrap">
                        <Link href={`${config.routes.user}/@${comment.user.nickname}`}>
                            <p className="text-mutated-for cursor-pointer text-sm font-medium hover:underline">
                                {comment.user.full_name}
                            </p>
                        </Link>

                        <p className="text-[15px]">{comment.content}</p>
                    </div>

                    {comment.user_id === currentUser?.data.id && (
                        <CommentActions
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                            comment={comment}
                        />
                    )}
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

                    <p
                        className="text-mutated-for text-muted-foreground cursor-pointer text-xs font-medium select-none hover:underline"
                        onClick={() => {
                            setIsReplying(true)
                        }}
                    >
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
                        {level < 2 && (
                            <div className="absolute bottom-3 left-[15.5px] flex h-9 w-7 flex-col self-stretch rounded-bl-lg border-t-0 border-b-2 border-l-2 border-zinc-500 bg-transparent select-none dark:border-zinc-600"></div>
                        )}
                        <p
                            className="text-mutated-for text-muted-foreground ml-4 cursor-pointer text-sm font-medium select-none hover:underline"
                            onClick={handleLoadReplies}
                        >
                            Xem thêm {comment.reply_count - (comment.replies?.length || 0)} trả lời
                        </p>
                    </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-1.5">
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                mutateComments={mutateComments}
                                level={level + 1}
                                post={post}
                            />
                        ))}

                        {level + 1 < 3 && !isReplying && (
                            <CommentComposer post={post} parentCommentId={comment.id} level={level + 1} />
                        )}
                    </div>
                )}

                {isReplying && (
                    <CommentComposer
                        post={post}
                        parentCommentId={comment.id}
                        level={level + 1}
                        replyUser={comment.user}
                    />
                )}
            </div>
        </div>
    )
}

export default CommentItem
