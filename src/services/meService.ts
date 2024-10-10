import { AxiosResponse } from 'axios'
import { UserModel } from '~/type/type'
import config from '~/config'
import * as request from '~/utils/httpRequest'

interface Response {
    data: UserModel
    meta?: {
        pagination: {
            exp: number
        }
    }
}

export const getCurrentUser = async (): Promise<AxiosResponse<Response>> => {
    try {
        return await request.get(config.apiEndpoint.me.getCurrentUser)
    } catch (error: any) {
        return error
    }
}

export const updateCurrentUser = async (formData: FormData): Promise<AxiosResponse<Response>> => {
    try {
        return await request.patch(config.apiEndpoint.me.updateCurrentUser, formData)
    } catch (error: any) {
        return error
    }
}
