import { ConversationModel, ConversationResponse } from '~/type/type'
import * as request from '~/utils/httpRequest'

export const getConversations = async ({
    page,
    per_page = 15,
}: {
    page: number
    per_page?: number
}): Promise<ConversationResponse | undefined> => {
    try {
        const response = await request.get('/conversations', {
            params: {
                page,
                per_page,
            },
        })
        return response.data
    } catch (error: any) {
        console.log(error)
    }
}

export const getConversationByUuid = async ({
    uuid,
}: {
    uuid: string
}): Promise<{ data: ConversationModel } | undefined> => {
    try {
        const response = await request.get(`/conversations/${uuid}`)
        return response.data
    } catch (error: any) {
        console.log(error)
    }
}
