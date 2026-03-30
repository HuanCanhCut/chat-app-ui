import { ResponsePagination } from '~/type/common.type'
import { StoryModel } from '~/type/story.type'
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
