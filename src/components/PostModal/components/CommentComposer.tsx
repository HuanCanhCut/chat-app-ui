import { PostResponse } from '~/type/post.type'

interface CommentComposerProps {
    post: PostResponse
}

const CommentComposer: React.FC<CommentComposerProps> = ({ post }) => {
    return <div>comment composer</div>
}

export default CommentComposer
