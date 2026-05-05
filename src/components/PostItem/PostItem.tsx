import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Ellipsis } from 'lucide-react'
import moment from 'moment-timezone'
import { toast } from 'sonner'

import PostAction from './components/PostAction/PostAction'
import MediaGrid from '~/components/MediaGrid'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import UserAvatar from '~/components/UserAvatar'
import config from '~/config'
import { sendEvent } from '~/helpers/events'
import handleApiError from '~/helpers/handleApiError'
import { cn } from '~/lib/utils'
import { selectCurrentUser } from '~/redux/selector'
import { useAppSelector } from '~/redux/types'
import * as postServices from '~/services/postService'
import { PostResponse } from '~/type/post.type'

interface PostItemProps {
    post: PostResponse
    isModal?: boolean
}

const PostItem = ({ post, isModal = false }: PostItemProps) => {
    const currentUser = useAppSelector(selectCurrentUser)

    const mediaContainerRef = useRef<HTMLDivElement>(null)

    const captionRef = useRef<HTMLParagraphElement>(null)
    const [expanded, setExpanded] = useState(false)
    const [shouldClamp, setShouldClamp] = useState(false)

    const [isShowConfirmModal, setIsShowConfirmModal] = useState(false)

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

        return date.format('DD [tháng] MM, YYYY [lúc] HH:mm')
    }

    const handleDeletePost = async () => {
        try {
            await postServices.deletePost({ postId: post.id })

            toast.success('Xóa bài viết thành công')

            sendEvent('POST:DELETE', { postId: post.id })
        } catch (error) {
            handleApiError(error)
        }
    }

    return (
        <div className="relative rounded-lg bg-white dark:bg-[#27292a]">
            {currentUser?.data.id === post.user_id && (
                <>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="absolute top-4 right-4 z-10 border-none bg-transparent ring-0 focus-visible:ring-0 dark:bg-transparent"
                            >
                                <Ellipsis />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem
                                onClick={() => {
                                    setIsShowConfirmModal(true)
                                }}
                            >
                                Xóa bài viết
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <AlertDialog open={isShowConfirmModal} onOpenChange={setIsShowConfirmModal}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Bạn có chắc chắn muốn xóa bài viết này không?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Hành động này không thể hoàn tác. Bài viết sẽ bị xóa vĩnh viễn khỏi máy chủ của
                                    chúng tôi.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeletePost}>Tiếp tục</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )}
            <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                    <Link href={`${config.routes.user}/@${post.user.nickname}`}>
                        <UserAvatar src={post.user.avatar} size={42} />
                    </Link>
                    <div className="-mt-1 flex flex-col">
                        <Link href={`${config.routes.user}/@${post.user.nickname}`}>
                            <span className="text-base font-semibold hover:underline">{post.user.full_name}</span>
                        </Link>
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
                <div className={cn('h-auto w-full overflow-hidden')} ref={mediaContainerRef}>
                    <MediaGrid
                        media={post.post_media.map((md) => {
                            return { url: md.media_url, type: md.media_type }
                        })}
                        isShowRemoveButton={false}
                        className="border-none [&_img]:rounded-none [&_video]:rounded-none"
                    />
                </div>
            )}

            <PostAction post={post} isModal={isModal} />
        </div>
    )
}

export default PostItem
