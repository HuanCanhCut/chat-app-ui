import { AxiosResponse } from 'axios'
import { FriendsResponse } from '~/type/type'
import * as request from '~/utils/httpRequest'

interface GetFriendsProps {
    page?: number
    per_page?: number
}

export const getFriends = async ({
    page = 1,
    per_page = 10,
}: GetFriendsProps): Promise<AxiosResponse<FriendsResponse>> => {
    try {
        return await request.get(`users/friends`, {
            params: {
                page,
                per_page,
            },
        })
    } catch (error: any) {
        return error
    }
}
