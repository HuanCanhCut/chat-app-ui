import { useState } from 'react'
import { MessageCircle, Send, ThumbsUp } from 'lucide-react'

import baseReactionIcon from '~/common/baseReactionIcon'
import ReactionModal from '~/components/ReactionModal/ReactionModal'
import { PostResponse } from '~/type/post.type'

const iconMapping = baseReactionIcon(18)

interface PostActionProps {
    post: PostResponse
}

const PostAction = ({ post }: PostActionProps) => {
    const [openReactionModal, setOpenReactionModal] = useState({
        isOpen: false,
        postId: 0,
    })

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
                {post.top_reactions?.length && (
                    <div
                        onClick={() =>
                            setOpenReactionModal({
                                isOpen: true,
                                postId: post.id,
                            })
                        }
                        className="group flex cursor-pointer"
                    >
                        {post.top_reactions.map((reaction, index) => {
                            const icon = iconMapping[reaction.react]

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
                        <span className="text-muted-foreground ml-1 select-none group-hover:underline">
                            {post.reaction_count}
                        </span>
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
                <button className="flex-center text-muted-foreground flex-1 rounded-sm py-1 font-medium hover:bg-gray-100 dark:hover:bg-zinc-500/20">
                    <ThumbsUp size={18} /> <span className="ml-2 select-none">Thích</span>
                </button>
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
