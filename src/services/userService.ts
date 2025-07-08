import { UserResponse } from '~/type/type'
import * as request from '~/utils/httpRequest'

export const getAnUser = async (nickname: string): Promise<UserResponse | undefined> => {
    try {
        const response = await request.get(`users/@${nickname}`)

        return response.data
    } catch (error: any) {
        throw error
    }
}
