import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Send, ThumbsUp } from 'lucide-react'
import { mutate } from 'swr'
import { Instance, Props } from 'tippy.js'

import baseReactionIcon from '~/common/baseReactionIcon'
import CustomTippy from '~/components/CustomTippy'
import ReactionModal from '~/components/ReactionModal/ReactionModal'
import SWRKey from '~/enum/SWRKey'
import handleApiError from '~/helpers/handleApiError'
import * as postService from '~/services/postService'
import { GetPostResponse, PostResponse } from '~/type/post.type'
import { BaseReactionUnified } from '~/type/reaction.type'

interface PostActionProps {
    post: PostResponse
}

const iconMapping = baseReactionIcon(36)

const reactionNameMapping: Record<keyof typeof iconMapping, string> = {
    '1f44d': 'Thích',
    '1f970': 'Thương thương',
    '2764-fe0f': 'Yêu thích',
    '1f602': 'Haha',
    '1f62e': 'Wow',
    '1f622': 'Buồn',
    '1f621': 'Giận',
}

const PostAction = ({ post }: PostActionProps) => {
    const reactionTippyRef = useRef<Instance<Props> | null>(null)

    const [openReactionModal, setOpenReactionModal] = useState({
        isOpen: false,
        postId: 0,
    })

    const handleReaction = async (unified?: BaseReactionUnified) => {
        try {
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
                                ...postResponse.data,
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
        } finally {
            // await while hover reaction tippy reset
            setTimeout(() => {
                reactionTippyRef.current?.hide()
            }, 100)
        }
    }

    const renderReaction = () => {
        return (
            <div className="flex items-center gap-1.5 rounded-full bg-white p-1 dark:bg-[#27292a]">
                {(() => {
                    return Object.keys(iconMapping).map((key, index) => {
                        const unified = key as keyof typeof iconMapping

                        const icon = iconMapping[unified]
                        return (
                            <motion.button
                                key={key}
                                whileHover={{ scale: 1.2 }}
                                initial={{ y: 20, opacity: 0 }}
                                transition={{ duration: 0.1, delay: index * 0.02 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                onClick={() => {
                                    handleReaction(unified)
                                }}
                            >
                                {icon}
                            </motion.button>
                        )
                    })
                })()}
            </div>
        )
    }

    return (
        <>
            {openReactionModal.isOpen && (
                <ReactionModal
                    isOpen={openReactionModal.isOpen}
                    onClose={() => setOpenReactionModal({ isOpen: false, postId: 0 })}
                    reactionableId={openReactionModal.postId}
                    reactionableType="Post"
                />
            )}

            <div className="relative flex items-center justify-between px-2 py-2 pb-0">
                {(post.top_reactions?.length || 0) > 0 && (
                    <div
                        onClick={() =>
                            setOpenReactionModal({
                                isOpen: true,
                                postId: post.id,
                            })
                        }
                        className="group flex cursor-pointer"
                    >
                        {post.top_reactions?.map((reaction, index) => {
                            const icon = baseReactionIcon(18)[reaction.react]

                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-center rounded-full border-2 border-white dark:border-[#27292a]"
                                    style={{
                                        marginLeft: index === 0 ? 0 : '-4px',
                                        zIndex: post.top_reactions!.length - index,
                                    }}
                                >
                                    {icon}
                                </div>
                            )
                        })}
                        {post.reaction_count > 0 && (
                            <span className="text-muted-foreground ml-1 select-none group-hover:underline">
                                {post.reaction_count}
                            </span>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    {post.comment_count > 0 && (
                        <div className="flex cursor-pointer">
                            <span className="text-muted-foreground ml-1 select-none hover:underline">
                                {post.comment_count} bình luận
                            </span>
                        </div>
                    )}

                    {post.share_count > 0 && (
                        <div className="flex cursor-pointer">
                            <span className="text-muted-foreground ml-1 select-none hover:underline">
                                {post.share_count} chia sẻ
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center px-2 py-1">
                <CustomTippy
                    trigger="mouseenter"
                    renderItem={renderReaction}
                    timeDelayOpen={400}
                    timeDelayClose={500}
                    placement="top-start"
                    className="flex-center w-full flex-1"
                    offsetY={10}
                    initialScale={0.95}
                    onShow={(instance) => {
                        reactionTippyRef.current = instance
                    }}
                >
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
                                            <span className="ml-2 select-none">{reactionNameMapping[react]}</span>
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
                </CustomTippy>
                <button className="flex-center text-muted-foreground flex-1 rounded-sm py-1 font-medium hover:bg-gray-100 dark:hover:bg-zinc-500/20">
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
