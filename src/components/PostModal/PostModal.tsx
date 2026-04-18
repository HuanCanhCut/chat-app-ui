import React from 'react'
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
import * as commentServices from '~/services/commentService'
import * as commentService from '~/services/commentService'
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
                                    <CommentItem comment={comment} mutateComments={mutate} post={post} />
                                </React.Fragment>
                            )
                        })}
                    </InfiniteScroll>
                )}
            </div>

            <CommentComposer post={post} />
        </PopperWrapper>
    )
}

export default PostModal
