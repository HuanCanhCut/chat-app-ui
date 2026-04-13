import { ResponsePagination } from '~/type/common.type'
import { BaseReactionUnified, ReactionModel } from '~/type/reaction.type'
import { StoryModel, StoryWithReactions, UserViewedStoryModel } from '~/type/story.type'
import { UserModel } from '~/type/user.type'
import * as request from '~/utils/httpRequest'

export const getStories = async ({
    page,
    per_page,
}: {
    page: number
    per_page: number
}): Promise<ResponsePagination<StoryModel[]>> => {
    const response = await request.get('/stories', {
        params: {
            page,
            per_page,
        },
    })
    return response.data
}

export const getUserStories = async (
    uuid: string,
): Promise<{
    data: StoryWithReactions[]
    meta: {
        general_conversation?: {
            uuid?: string
        }
    }
}> => {
    const response = await request.get(`/stories/${uuid}`)
    return response.data
}

export const reactStory = async (story_uuid: string, unified: BaseReactionUnified) => {
    const response = await request.post(`/stories/${story_uuid}/react`, { unified })
    return response.data
}

export const createStory = async ({
    type,
    url,
    caption,
}: {
    type: 'text' | 'image' | 'video'
    url: string
    caption?: string
}) => {
    try {
        const response = await request.post('/stories', {
            type,
            url,
            caption,
        })
        return response.data
    } catch (error) {
        throw error
    }
}

export const viewStory = async (uuid: string) => {
    const response = await request.post(`/stories/${uuid}/view`)
    return response.data
}

interface UserViewedResponse extends UserViewedStoryModel {
    user: UserModel & ReactionModel[]
}

export const getUserViewedStories = async ({
    story_uuid,
    page,
    per_page,
}: {
    story_uuid: string
    page: number
    per_page: number
}): Promise<ResponsePagination<UserViewedResponse[]>> => {
    const response = await request.get(`/stories/${story_uuid}/viewed`, {
        params: {
            page,
            per_page,
        },
    })
    return response.data
}
