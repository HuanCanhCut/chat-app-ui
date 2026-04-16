import * as request from '~/utils/httpRequest'

export const getPostComments = async ({ postId }: { postId: number }) => {
    return request.get(`/posts/${postId}/comments`)
}
