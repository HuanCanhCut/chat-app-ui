import { MessageCircle, Send, ThumbsUp } from 'lucide-react'

import baseReactionIcon from '~/common/baseReactionIcon'
import { PostResponse } from '~/type/post.type'

const iconMapping = baseReactionIcon(18)

interface PostActionProps {
    post: PostResponse
}

const PostAction = ({ post }: PostActionProps) => {
    return (
        <>
            <div className="relative flex items-center px-2 py-2 pb-0">
                {post.top_reactions?.length && (
                    <div className="flex cursor-pointer">
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
                        <span className="text-muted-foreground ml-1 select-none">{post.reaction_count}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center px-2 py-1">
                <button className="flex-center text-muted-foreground flex-1 rounded-sm py-1 font-medium hover:bg-gray-100 dark:hover:bg-zinc-500/20">
                    <ThumbsUp size={18} /> <span className="ml-2">Thích</span>
                </button>
                <button className="flex-center text-muted-foreground flex-1 rounded-sm py-1 font-medium hover:bg-gray-100 dark:hover:bg-zinc-500/20">
                    <MessageCircle size={18} /> <span className="ml-2">Bình luận</span>
                </button>
                <button className="flex-center text-muted-foreground flex-1 rounded-sm py-1 font-medium hover:bg-gray-100 dark:hover:bg-zinc-500/20">
                    <Send size={18} /> <span className="ml-2">Chia sẻ</span>
                </button>
            </div>
        </>
    )
}

export default PostAction
