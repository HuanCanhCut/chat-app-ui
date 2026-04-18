import { CommentResponse } from '~/type/comment'
import { GetPostResponse, PostModel, PostResponse } from '~/type/post.type'
import { BaseReactionUnified, ReactionModel } from '~/type/reaction.type'
import * as request from '~/utils/httpRequest'

interface CreatePostData {
    postData: {
        caption: string
        media?: Array<{
            media_url: string
            media_type: 'image' | 'video'
        }>
        is_public: boolean
    }
}

export const createPost = async ({ postData }: CreatePostData): Promise<{ data: PostResponse }> => {
    const response = await request.post('posts', postData)
    return response.data
}

export const getPosts = async ({ limit, cursor }: { limit: number; cursor?: string }): Promise<GetPostResponse> => {
    const response = await request.get('posts', {
        params: {
            limit,
            cursor,
        },
    })
    return response.data
}

export const getPostById = async ({
    postId,
}: {
    postId: number
}): Promise<{
    data: PostModel & { top_reactions?: (Pick<ReactionModel, 'reactionable_id'> & { react: BaseReactionUnified })[] }
}> => {
    const response = await request.get(`posts/${postId}`)
    return response.data
}

export const reactPost = async ({ postId, unified }: { postId: number; unified: BaseReactionUnified }) => {
    try {
        const response = await request.post(`posts/${postId}/react`, {
            unified,
        })

        return response.data
    } catch (error: any) {
        throw error
    }
}

export const unreactPost = async ({ postId }: { postId: number }) => {
    try {
        const response = await request.del(`posts/${postId}/unreact`)

        return response.data
    } catch (error: any) {
        throw error
    }
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
