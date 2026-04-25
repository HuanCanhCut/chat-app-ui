import React, { useEffect } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { toast } from 'sonner'
import useSWR from 'swr'

import Button from '../Button'
import { NoCommentIcon } from '../Icons'
import PopperWrapper from '../PopperWrapper'
import PostItem from '../PostItem'
import CommentComposer from './components/CommentComposer'
import CommentItem from './components/CommentItem'
import { faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SWRKey from '~/enum/SWRKey'
import { listenEvent } from '~/helpers/events'
import * as commentServices from '~/services/commentService'
import * as commentService from '~/services/commentService'
import { CommentResponse } from '~/type/comment'
import { ResponseCursorPagination } from '~/type/common.type'
import { PostResponse } from '~/type/post.type'

const COMMENT_LIMIT = 15

interface PostModalProps {
    post: PostResponse
    onClose?: () => void
}

const PostModal: React.FC<PostModalProps> = ({ post, onClose = () => {} }) => {
    const { data: comments, mutate } = useSWR(post.id ? [SWRKey.GET_POST_COMMENTS, post.id] : null, () => {
        return commentService.getPostComments({ postId: post.id, limit: COMMENT_LIMIT })
    })

    useEffect(() => {
        const remove = listenEvent('COMMENT:NEW', ({ comment }: { comment: CommentResponse }) => {
            mutate(
                (prev: ResponseCursorPagination<CommentResponse[]> | undefined) => {
                    if (!prev) {
                        return prev
                    }

                    // if comment is root comment
                    if (!comment.parent_id) {
                        return {
                            ...prev,
                            data: [comment, ...prev.data],
                        }
                    }
                    //  if comment is child comment
                    else {
                        const addComment = (comments: CommentResponse[]): CommentResponse[] => {
                            return comments.map((cmt): CommentResponse => {
                                if (cmt.id === comment.parent_id) {
                                    return {
                                        ...cmt,
                                        replies: [...(cmt.replies || []), comment],
                                        reply_count: cmt.reply_count + 1,
                                    }
                                }

                                if (cmt.replies && cmt.replies.length > 0) {
                                    return {
                                        ...cmt,
                                        replies: addComment(cmt.replies),
                                    }
                                }

                                return cmt
                            })
                        }

                        return {
                            ...prev,
                            data: addComment(prev.data),
                        }
                    }
                },
                {
                    revalidate: false,
                },
            )
        })

        return remove
    }, [mutate])

    useEffect(() => {
        const remove = listenEvent('COMMENT:REMOVE', ({ commentId }) => {
            mutate(
                (prev: ResponseCursorPagination<CommentResponse[]> | undefined) => {
                    if (!prev) return prev

                    const removeComment = (comments: CommentResponse[]): CommentResponse[] => {
                        return comments
                            .map((comment) => {
                                if (comment.replies && comment.replies.length > 0) {
                                    const filteredReplies = removeComment(comment.replies)
                                    const removed = comment.replies.length - filteredReplies.length

                                    return {
                                        ...comment,
                                        replies: filteredReplies,
                                        reply_count: comment.reply_count - removed,
                                    }
                                }
                                return comment
                            })
                            .filter((comment) => comment.id !== commentId)
                    }

                    return {
                        ...prev,
                        data: removeComment(prev.data),
                    }
                },
                {
                    revalidate: false,
                },
            )
        })

        return remove
    }, [mutate])

    return (
        <PopperWrapper className="flex w-[650px] flex-col overflow-hidden">
            <header className="relative flex justify-center border-b border-gray-300 p-4 dark:border-zinc-700">
                <h3 className="text-xl font-semibold">{`Bình luận của ${post.user.full_name}`}</h3>
                <Button buttonType="icon" onClick={onClose} className="absolute top-1/2 right-3 -translate-y-1/2">
                    <FontAwesomeIcon icon={faXmark} className="text-xl" />
                </Button>
            </header>

            <div className="w-full flex-1 overflow-y-auto" id="post_comment_scrollable">
                <PostItem post={post} isModal={true} />

                {!comments?.data.length ? (
                    <div className="text-muted-foreground flex flex-col items-center justify-center gap-1 py-4">
                        <NoCommentIcon />
                        <p className="text-xl font-bold">Chưa có bình luận nào</p>
                        <p className="text-base">Hãy là người đầu tiên bình luận</p>
                    </div>
                ) : (
                    <InfiniteScroll
                        dataLength={comments?.data.length || 0}
                        next={async () => {
                            try {
                                const response = await commentServices.getPostComments({
                                    limit: COMMENT_LIMIT,
                                    postId: post.id,
                                    cursor: comments?.meta.pagination.next_cursor,
                                })
                                const newData = {
                                    ...comments,
                                    data: [...comments.data, ...response.data],
                                    meta: {
                                        ...comments.meta,
                                        pagination: {
                                            ...response.meta.pagination,
                                        },
                                    },
                                }

                                mutate(newData, false)
                            } catch (_) {
                                toast.error('Lỗi khi tải thêm bình luận')
                            }
                        }}
                        className="overflow-hidden! px-2"
                        hasMore={comments?.meta.pagination.has_next_page || false}
                        scrollThreshold={0.8}
                        loader={
                            <div className="flex justify-center">
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            </div>
                        }
                        scrollableTarget="post_comment_scrollable"
                    >
                        {comments?.data.map((comment) => {
                            return (
                                <React.Fragment key={comment.id}>
                                    <CommentItem post={post} comment={comment} mutateComments={mutate} />
                                </React.Fragment>
                            )
                        })}
                    </InfiniteScroll>
                )}
            </div>

            <div className="p-3">
                <CommentComposer post={post} />
            </div>
        </PopperWrapper>
    )
}

export default PostModal
