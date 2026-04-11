import { useEffect, useRef, useState } from 'react'
import moment from 'moment-timezone'

import PostAction from './PostAction'
import MediaGrid from '~/components/MediaGrid'
import UserAvatar from '~/components/UserAvatar'
import { cn } from '~/lib/utils'
import { PostResponse } from '~/type/post.type'

interface PostItemProps {
    post: PostResponse
}

const PostItem = ({ post }: PostItemProps) => {
    const mediaContainerRef = useRef<HTMLDivElement>(null)

    const captionRef = useRef<HTMLParagraphElement>(null)
    const [expanded, setExpanded] = useState(false)
    const [shouldClamp, setShouldClamp] = useState(false)

    useEffect(() => {
        if (captionRef.current) {
            setShouldClamp(captionRef.current.scrollHeight > captionRef.current.clientHeight)
        }
    }, [])

    useEffect(() => {
        if (mediaContainerRef.current) {
            mediaContainerRef.current.style.maxHeight = mediaContainerRef.current.clientWidth + 'px'
        }
    }, [mediaContainerRef])

    const formatTime = (dateTime: Date): string => {
        const date = moment(dateTime)
        const now = moment()

        if (date.isSame(now, 'day')) {
            return moment(date).fromNow()
        }

        if (date.isSame(now.subtract(1, 'day'), 'day')) {
            return `Hôm qua lúc ${date.format('HH:mm')}`
        }

        return date.format('D [tháng] M [lúc] HH:mm')
    }

    return (
        <div className="rounded-lg bg-white dark:bg-[#27292a]">
            <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                    <UserAvatar src={post.user.avatar} />
                    <div className="flex flex-col">
                        <span className="text-base font-semibold">{post.user.full_name}</span>
                        <span className="text-muted-foreground text-[13px] font-medium">
                            {formatTime(post.created_at)}
                        </span>
                    </div>
                </div>
            </div>

            <p
                ref={captionRef}
                className={cn('mt-1 px-3 text-base whitespace-pre-wrap', {
                    'line-clamp-3': !expanded,
                })}
            >
                {post.caption}
            </p>

            {shouldClamp && (
                <button className="text-muted-foreground px-3 text-sm" onClick={() => setExpanded(!expanded)}>
                    {expanded ? 'Thu gọn' : 'Xem thêm'}
                </button>
            )}

            {post.post_media.length > 0 && (
                <div className={cn('h-auto w-full overflow-hidden rounded-md')} ref={mediaContainerRef}>
                    <MediaGrid
                        media={post.post_media.map((md) => {
                            return { url: md.media_url, type: md.media_type }
                        })}
                        isShowRemoveButton={false}
                        className="border-none [&_img]:rounded-none [&_video]:rounded-none"
                    />
                </div>
            )}

            <PostAction post={post} />
        </div>
    )
}

export default PostItem
