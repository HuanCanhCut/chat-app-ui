import { AxiosResponse } from 'axios'
import { UserResponse } from '~/type/type'
import * as request from '~/utils/httpRequest'

export const getAnUser = async (nickname: string): Promise<AxiosResponse<UserResponse>> => {
    try {
        return await request.get(`users/@${nickname}`)
    } catch (error: any) {
        return error
    }
}
