import { UserModel } from '~/type/type'
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
        const response = await request.post('/auth/register', {
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
        const response = await request.post('/auth/login', {
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
        return await request.post('/auth/logout')
    } catch (error: any) {
        throw error
    }
}

export const loginWithGoogle = async (token: string): Promise<Response> => {
    try {
        const response = await request.post('/auth/loginwithtoken', {
            token,
        })

        return response.data
    } catch (error: any) {
        throw error
    }
}

export const sendVerifyCode = async (email: string): Promise<AxiosResponse<void>> => {
    try {
        return await request.post('/auth/verify', {
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
        return await request.post('/auth/reset-password', {
            email,
            password,
            code,
        })
    } catch (error: any) {
        throw error
    }
}
