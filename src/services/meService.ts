import { AxiosResponse } from 'axios'

import { UserModel } from '~/type/type'
import * as request from '~/utils/httpRequest'

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
        const response = await request.get('/me')

        return response.data
    } catch (error: any) {
        throw error
    }
}

export const updateCurrentUser = async (formData: FormData): Promise<AxiosResponse<void>> => {
    try {
        return await request.patch('/me', formData)
    } catch (error: any) {
        throw error
    }
}

export const updateActiveStatus = async (is_online: boolean): Promise<AxiosResponse<void>> => {
    try {
        return await request.patch('/me/active-status', { is_online })
    } catch (error: any) {
        throw error
    }
}
