import { useState } from 'react'
import ReactModal from 'react-modal'
import { MessageCircle, Send, ThumbsUp } from 'lucide-react'
import { mutate } from 'swr'

import baseReactionIcon from '~/common/baseReactionIcon'
import BaseReaction from '~/components/BaseReaction'
import { reactionNameMapping } from '~/components/BaseReaction/BaseReaction'
import PostModal from '~/components/PostModal'
import TopReactions from '~/components/TopReactions'
import SWRKey from '~/enum/SWRKey'
import handleApiError from '~/helpers/handleApiError'
import * as postService from '~/services/postService'
import { GetPostResponse, PostResponse } from '~/type/post.type'
import { BaseReactionUnified } from '~/type/reaction.type'

interface PostActionProps {
    post: PostResponse
    isModal?: boolean
}

const PostAction = ({ post, isModal = false }: PostActionProps) => {
    const [openPostModal, setOpenPostModal] = useState(false)

    const handleReaction = async (unified?: BaseReactionUnified) => {
        try {
            mutate(
                SWRKey.GET_POSTS,
                (prev?: GetPostResponse) => {
                    if (!prev) {
                        return prev
                    }

                    const newData = prev.data.map((currentPost: PostResponse) => {
                        if (currentPost.id === post.id) {
                            return {
                                ...currentPost,
                                reaction: unified,
                            }
                        }

                        return currentPost
                    })

                    return {
                        ...prev,
                        data: newData,
                    }
                },
                {
                    revalidate: false,
                },
            )

            if (unified) {
                if (post.reaction !== unified) {
                    await postService.reactPost({ postId: post.id, unified })
                }
            } else {
                await postService.unreactPost({ postId: post.id })
            }

            const postResponse = await postService.getPostById({ postId: post.id })

            mutate(
                SWRKey.GET_POSTS,
                (prev?: GetPostResponse) => {
                    if (!prev) {
                        return prev
                    }

                    const newData = prev.data.map((currentPost: PostResponse) => {
                        if (currentPost.id === post.id) {
                            return {
                                ...currentPost,
                                ...postResponse,
                                reaction: unified,
                                top_reactions: postResponse.data.top_reactions,
                            }
                        }

                        return currentPost
                    })

                    return {
                        ...prev,
                        data: newData,
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

    const handleOpenPostModal = () => {
        if (!isModal) {
            setOpenPostModal(true)
        }
    }

    const handleClosePostModal = () => {
        setOpenPostModal(false)
    }

    const handleMutatePost = async () => {
        try {
            const postResponse = await postService.getPostById({ postId: post.id })

            // mutate post
            mutate(SWRKey.GET_POSTS, (prev?: GetPostResponse) => {
                if (!prev) {
                    return prev
                }

                const newData = prev.data.map((currentPost: PostResponse) => {
                    if (currentPost.id === post.id) {
                        return {
                            ...currentPost,
                            ...postResponse,
                        }
                    }

                    return currentPost
                })

                return {
                    ...prev,
                    data: newData,
                }
            })
        } catch (_) {
            //
        }
    }

    return (
        <>
            <ReactModal
                isOpen={openPostModal}
                ariaHideApp={false}
                overlayClassName={'overlay'}
                closeTimeoutMS={200}
                onRequestClose={handleClosePostModal}
                className={'modal'}
                onAfterClose={handleMutatePost}
            >
                <PostModal post={post} onClose={handleClosePostModal} />
            </ReactModal>

            <div className="relative flex items-center justify-between">
                {post.top_reactions && (
                    <TopReactions
                        topReactions={post.top_reactions}
                        reactionCount={post.reaction_count}
                        reactionableType="Post"
                        className="px-2 py-2 pb-0"
                    />
                )}

                <div className="ml-auto flex items-center gap-2">
                    {post.comment_count > 0 && (
                        <div className="flex cursor-pointer px-2 py-2 pb-0">
                            <span
                                className="text-muted-foreground ml-1 select-none hover:underline"
                                onClick={handleOpenPostModal}
                            >
                                {post.comment_count} bình luận
                            </span>
                        </div>
                    )}

                    {post.share_count > 0 && (
                        <div className="flex cursor-pointer px-2 py-2 pb-0">
                            <span className="text-muted-foreground ml-1 select-none hover:underline">
                                {post.share_count} chia sẻ
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center px-2 py-1">
                <BaseReaction handleReaction={handleReaction} className="flex-center w-full flex-1">
                    <button
                        className="flex-center text-muted-foreground flex-1 rounded-sm py-1 font-medium hover:bg-gray-100 dark:hover:bg-zinc-500/20"
                        onClick={() => {
                            handleReaction(post.reaction ? undefined : '1f44d')
                        }}
                    >
                        {post.reaction ? (
                            <>
                                {(() => {
                                    const iconMapping = baseReactionIcon(18)

                                    const react = post.reaction

                                    const icon = iconMapping[react]

                                    return (
                                        <>
                                            {icon}{' '}
                                            <span
                                                className={`ml-2 select-none`}
                                                style={{
                                                    color: `var(--reaction-${reactionNameMapping[react].type})`,
                                                }}
                                            >
                                                {reactionNameMapping[react].name}
                                            </span>
                                        </>
                                    )
                                })()}
                            </>
                        ) : (
                            <>
                                <ThumbsUp size={18} /> <span className="ml-2 select-none">Thích</span>
                            </>
                        )}
                    </button>
                </BaseReaction>
                <button
                    className="flex-center text-muted-foreground flex-1 rounded-sm py-1 font-medium hover:bg-gray-100 dark:hover:bg-zinc-500/20"
                    onClick={handleOpenPostModal}
                >
                    <MessageCircle size={18} /> <span className="ml-2 select-none">Bình luận</span>
                </button>
                <button className="flex-center text-muted-foreground flex-1 rounded-sm py-1 font-medium hover:bg-gray-100 dark:hover:bg-zinc-500/20">
                    <Send size={18} /> <span className="ml-2 select-none">Chia sẻ</span>
                </button>
            </div>
        </>
    )
}

export default PostAction
