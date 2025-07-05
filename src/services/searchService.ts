import { SearchHistory, SearchMessageResponse } from '~/type/type'
import * as request from '~/utils/httpRequest'

export const searchUser = async (value: string) => {
    try {
        const response = await request.get('/users/search', {
            params: {
                q: value,
                type: 'less',
            },
        })

        return response.data
    } catch (error) {
        throw error
    }
}

export const getSearchHistory = async (): Promise<SearchHistory | undefined> => {
    try {
        const response = await request.get('users/search-history')

        return response.data
    } catch (error) {
        throw error
    }
}

export const setSearchHistory = async (user_search_id: number) => {
    try {
        await request.post('users/search-history', { user_search_id })
    } catch (error) {
        throw error
    }
}

export const searchMessage = async ({
    q,
    page,
    per_page,
    conversation_uuid,
}: {
    q: string
    page: number
    per_page: number
    conversation_uuid: string
}): Promise<SearchMessageResponse> => {
    try {
        const response = await request.get('messages/search', {
            params: {
                q,
                page,
                per_page,
                conversation_uuid,
            },
        })

        return response.data
    } catch (error) {
        throw error
    }
}
