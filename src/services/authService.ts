import { UserModel } from '~/type/type'
import config from '~/config'
import * as request from '~/utils/httpRequest'
import { AxiosResponse } from 'axios'

interface RegisterProps {
    email: string
    password: string
}

interface Response {
    data: UserModel
    meta?: {
        pagination: {
            exp: number
        }
    }
}

export const register = async ({ email, password }: RegisterProps): Promise<Response> => {
    try {
        const response = await request.post(config.apiEndpoint.auth.register, {
            email,
            password,
        })

        return response.data
    } catch (error: any) {
        throw error
    }
}

export const login = async ({ email, password }: RegisterProps): Promise<Response> => {
    try {
        const response = await request.post(config.apiEndpoint.auth.login, {
            email,
            password,
        })

        return response.data
    } catch (error: any) {
        throw error
    }
}

export const logout = async (): Promise<AxiosResponse<void>> => {
    try {
        return await request.post(config.apiEndpoint.auth.logout)
    } catch (error: any) {
        throw error
    }
}

export const loginWithGoogle = async (token: string): Promise<Response> => {
    try {
        const response = await request.post(config.apiEndpoint.auth.loginWithToken, {
            token,
        })

        return response.data
    } catch (error: any) {
        throw error
    }
}

export const sendVerifyCode = async (email: string): Promise<AxiosResponse<void>> => {
    try {
        return await request.post(config.apiEndpoint.auth.verify, {
            email,
        })
    } catch (error: any) {
        throw error
    }
}

export const resetPassword = async ({
    email,
    password,
    code,
}: {
    email: string
    password: string
    code: string
}): Promise<AxiosResponse<void>> => {
    try {
        return await request.post(config.apiEndpoint.auth.resetPassword, {
            email,
            password,
            code,
        })
    } catch (error: any) {
        throw error
    }
}
