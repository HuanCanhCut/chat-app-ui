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
import * as postServices from '~/services/postService'
import { CommentResponse } from '~/type/comment'
import { ResponseCursorPagination } from '~/type/common.type'
import { PostResponse } from '~/type/post.type'
import { BaseReactionUnified } from '~/type/reaction.type'
import { momentTimezone } from '~/utils/moment'

interface CommentItemProps {
    comment: CommentResponse
    mutateComments: KeyedMutator<ResponseCursorPagination<CommentResponse[]>>
    post: PostResponse
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, mutateComments, post }) => {
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
                await postServices.reactComment({
                    commentId: comment.id,
                    unified,
                })
            } else {
                await postServices.unreactComment({
                    commentId: comment.id,
                })
            }

            const commentResponse = await postServices.getCommentById({ commentId: comment.id })

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

    return (
        <div className="flex items-start gap-2 py-1">
            <Link href={`${config.routes.user}/@${comment.user.nickname}`}>
                <UserAvatar src={comment.user.avatar} size={32} />
            </Link>

            <div>
                <div className="flex items-center gap-1">
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
                <div className="mt-1 ml-2 flex items-center gap-3">
                    <Tippy content={formatTime(comment.created_at)}>
                        <p className="text-mutated-for text-muted-foreground cursor-pointer text-xs font-medium hover:underline">
                            {momentTimezone(comment.created_at)}
                        </p>
                    </Tippy>

                    <BaseReaction handleReaction={handleReaction}>
                        <p
                            className="text-mutated-for text-muted-foreground cursor-pointer text-xs font-semibold hover:underline"
                            style={{
                                color: comment.react
                                    ? `var(--reaction-${reactionNameMapping[comment.react].type})`
                                    : undefined,
                            }}
                        >
                            {comment.react ? reactionNameMapping[comment.react].name : 'Thích'}
                        </p>
                    </BaseReaction>

                    <p className="text-mutated-for text-muted-foreground cursor-pointer text-xs font-medium hover:underline">
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
            </div>
        </div>
    )
}

export default CommentItem
