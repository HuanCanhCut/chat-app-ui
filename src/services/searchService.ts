import { SearchHistory } from '~/type/type'
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
        console.log(error)
    }
}

export const getSearchHistory = async (): Promise<SearchHistory | undefined> => {
    try {
        const response = await request.get('users/search-history')

        return response.data
    } catch (error) {
        console.log(error)
    }
}

export const setSearchHistory = async (user_search_id: number) => {
    try {
        await request.post('users/search-history', { user_search_id })
    } catch (error) {
        console.log(error)
    }
}
