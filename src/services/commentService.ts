import { CommentResponse } from '~/type/comment'
import { ResponseCursorPagination } from '~/type/common.type'
import * as request from '~/utils/httpRequest'

export const getPostComments = async ({
    postId,
    limit,
    cursor,
}: {
    postId: number
    limit: number
    cursor?: string | null
}): Promise<ResponseCursorPagination<CommentResponse[]>> => {
    const response = await request.get(`/posts/${postId}/comments`, {
        params: {
            limit,
            cursor,
        },
    })

    return response.data
}
