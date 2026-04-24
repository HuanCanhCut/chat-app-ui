import { CommentResponse } from '~/type/comment'
import { ResponseCursorPagination } from '~/type/common.type'
import { BaseReactionUnified } from '~/type/reaction.type'
import * as request from '~/utils/httpRequest'

export const getPostComments = async ({
    postId,
    limit,
    cursor,
    parentId,
}: {
    postId: number
    limit: number
    cursor?: string | null
    parentId?: number
}): Promise<ResponseCursorPagination<CommentResponse[]>> => {
    const response = await request.get(`/posts/${postId}/comments`, {
        params: {
            limit,
            cursor,
            parent_id: parentId,
        },
    })

    return response.data
}

export const reactComment = async ({ unified, commentId }: { commentId: number; unified: BaseReactionUnified }) => {
    try {
        const response = await request.post(`/comments/${commentId}/react`, {
            unified,
        })

        return response.data
    } catch (error: any) {
        throw error
    }
}

export const unreactComment = async ({ commentId }: { commentId: number }) => {
    try {
        const response = await request.del(`comments/${commentId}/unreact`)

        return response.data
    } catch (error: any) {
        throw error
    }
}

export const getCommentById = async ({ commentId }: { commentId: number }): Promise<{ data: CommentResponse }> => {
    const response = await request.get(`/comments/${commentId}`)
    return response.data
}

export const createComment = async ({
    content,
    postId,
    parentId,
}: {
    content: string
    postId: number
    parentId?: number
}): Promise<{ data: CommentResponse }> => {
    const response = await request.post(`/comments/${postId}`, {
        content,
        parent_id: parentId || null,
    })

    return response.data
}
