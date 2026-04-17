import Link from 'next/link'
import Tippy from 'huanpenguin-tippy-react'
import { Ellipsis } from 'lucide-react'
import moment from 'moment-timezone'

import BaseReaction from '~/components/BaseReaction'
import TopReactions from '~/components/TopReactions'
import { Button } from '~/components/ui/button'
import UserAvatar from '~/components/UserAvatar'
import config from '~/config'
import { CommentResponse } from '~/type/comment'
import { BaseReactionUnified } from '~/type/reaction.type'
import { momentTimezone } from '~/utils/moment'

interface CommentItemProps {
    comment: CommentResponse
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
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

    const handleReaction = async (unified?: BaseReactionUnified | undefined) => {
        console.log('handleReaction')
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
                        <p className="text-mutated-for text-muted-foreground cursor-pointer text-xs font-semibold hover:underline">
                            Thích
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
