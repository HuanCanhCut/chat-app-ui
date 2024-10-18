import { AxiosResponse } from 'axios'
import { FriendsResponse } from '~/type/type'
import * as request from '~/utils/httpRequest'

interface GetFriendsProps {
    page?: number
    per_page?: number
    user_id: number
}

export const getFriends = async ({
    page = 1,
    per_page = 10,
    user_id,
}: GetFriendsProps): Promise<AxiosResponse<FriendsResponse>> => {
    try {
        return await request.get(`users/${user_id}/friends`, {
            params: {
                page,
                per_page,
            },
        })
    } catch (error: any) {
        return error
    }
}
