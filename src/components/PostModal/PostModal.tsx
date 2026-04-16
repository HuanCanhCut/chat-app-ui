import useSWR from 'swr'

import Button from '../Button'
import { NoCommentIcon } from '../Icons'
import PopperWrapper from '../PopperWrapper'
import PostItem from '../PostItem'
import { ScrollArea } from '../ui/scroll-area'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SWRKey from '~/enum/SWRKey'
import * as commentService from '~/services/commentService'
import { PostResponse } from '~/type/post.type'

interface PostModalProps {
    post: PostResponse
    onClose?: () => void
}

const PostModal: React.FC<PostModalProps> = ({ post, onClose = () => {} }) => {
    const { data: comments } = useSWR(SWRKey.GET_POST_COMMENTS, () => {
        return commentService.getPostComments({ postId: post.id })
    })

    return (
        <PopperWrapper className="flex w-[650px] flex-col overflow-hidden">
            <header className="relative flex justify-center border-b border-gray-300 p-4 dark:border-zinc-700">
                <h3 className="text-xl font-semibold">{`Bình luận của ${post.user.full_name}`}</h3>
                <Button buttonType="icon" onClick={onClose} className="absolute top-1/2 right-3 -translate-y-1/2">
                    <FontAwesomeIcon icon={faXmark} className="text-xl" />
                </Button>
            </header>

            <div className="w-full flex-1 overflow-y-auto">
                <PostItem post={post} isModal={true} />

                {!comments?.data.length ? (
                    <div className="text-muted-foreground flex flex-col items-center justify-center gap-1 py-4">
                        <NoCommentIcon />
                        <p className="text-xl font-bold">Chưa có bình luận nào</p>
                        <p className="text-base">Hãy là người đầu tiên bình luận</p>
                    </div>
                ) : null}
            </div>
        </PopperWrapper>
    )
}

export default PostModal
