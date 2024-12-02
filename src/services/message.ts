import { MessageResponse } from '~/type/type'
import * as request from '~/utils/httpRequest'

export const getMessages = async ({
    conversationUuid,
    page,
    per_page = 20,
}: {
    conversationUuid: string
    page: number
    per_page?: number
}): Promise<MessageResponse | undefined> => {
    try {
        const response = await request.get(`messages/${conversationUuid}`, {
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
