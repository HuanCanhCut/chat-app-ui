import { GetPostResponse } from '~/type/post.type'
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

export const createPost = async ({ postData }: CreatePostData) => {
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
