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

export const register = async ({ email, password }: RegisterProps): Promise<Response | undefined> => {
    try {
        const response = await request.post(config.apiEndpoint.auth.register, {
            email,
            password,
        })

        return response.data
    } catch (error: any) {
        console.log(error)
    }
}

export const login = async ({ email, password }: RegisterProps): Promise<Response | undefined> => {
    try {
        const response = await request.post(config.apiEndpoint.auth.login, {
            email,
            password,
        })

        return response.data
    } catch (error: any) {
        console.log(error)
    }
}

export const logout = async (): Promise<Response | undefined> => {
    try {
        const response = await request.post(config.apiEndpoint.auth.logout)

        return response.data
    } catch (error: any) {
        console.log(error)
    }
}

export const loginWithGoogle = async (token: string): Promise<Response | undefined> => {
    try {
        const response = await request.post(config.apiEndpoint.auth.loginWithToken, {
            token,
        })

        return response.data
    } catch (error: any) {
        return error
    }
}

export const sendVerifyCode = async (email: string): Promise<AxiosResponse<string>> => {
    try {
        return await request.post(config.apiEndpoint.auth.verify, {
            email,
        })
    } catch (error: any) {
        return error
    }
}

export const resetPassword = async ({
    email,
    password,
    code,
    onError,
}: {
    email: string
    password: string
    code: string
    onError?: (error: any) => void
}): Promise<string | undefined> => {
    try {
        const response = await request.post(config.apiEndpoint.auth.resetPassword, {
            email,
            password,
            code,
        })

        return response.data
    } catch (error: any) {
        onError?.(error)
    }
}
