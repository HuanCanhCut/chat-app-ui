import { UserModel } from '~/type/type'
import config from '~/config'
import * as request from '~/utils/httpRequest'
import { AxiosResponse } from 'axios'

interface Response {
    data: UserModel
    meta?: {
        pagination: {
            exp: number
        }
    }
}

export const getCurrentUser = async (): Promise<Response | undefined> => {
    try {
        const response = await request.get(config.apiEndpoint.me.getCurrentUser)

        return response.data
    } catch (error: any) {
        console.log(error)
    }
}

export const updateCurrentUser = async (formData: FormData): Promise<AxiosResponse<void>> => {
    try {
        return await request.patch(config.apiEndpoint.me.updateCurrentUser, formData)
    } catch (error: any) {
        throw error
    }
}
