import { ResponsePagination } from '~/type/common.type'
import { BaseReactionUnified } from '~/type/reaction.type'
import { StoryModel, StoryWithReactions } from '~/type/story.type'
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
