import { ConversationThemeResponse } from '~/type/type'
import * as request from '~/utils/httpRequest'

export const getThemes = async ({
    page,
    per_page,
}: {
    page: number
    per_page: number
}): Promise<ConversationThemeResponse> => {
    try {
        const response = await request.get('themes', {
            params: {
                page,
                per_page,
            },
        })

        return response.data
    } catch (error: any) {
        throw error
    }
}
