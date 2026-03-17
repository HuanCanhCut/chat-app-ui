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
