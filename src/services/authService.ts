import { AxiosResponse } from 'axios'
import { UserModel } from '~/type/type'
import * as request from '~/utils/httpRequest'

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

export const register = async ({ email, password }: RegisterProps): Promise<AxiosResponse<Response>> => {
    try {
        return await request.post('/auth/register', {
            email,
            password,
        })
    } catch (error: any) {
        return error
    }
}

export const login = async ({ email, password }: RegisterProps): Promise<AxiosResponse<Response>> => {
    try {
        return await request.post('/auth/login', {
            email,
            password,
        })
    } catch (error: any) {
        return error
    }
}

export const getCurrentUser = async (): Promise<AxiosResponse<Response>> => {
    try {
        return await request.get('/auth/me')
    } catch (error: any) {
        return error
    }
}

export const loginWithGoogle = async (token: string): Promise<AxiosResponse<Response>> => {
    try {
        return await request.post('/auth/loginwithtoken', {
            token,
        })
    } catch (error: any) {
        return error
    }
}

export const sendVerifyCode = async (email: string): Promise<AxiosResponse<Response>> => {
    try {
        return await request.post('/auth/verify', {
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
}: {
    email: string
    password: string
    code: string
}): Promise<AxiosResponse<Response>> => {
    try {
        return await request.post('/auth/reset-password', {
            email,
            password,
            code,
        })
    } catch (error: any) {
        return error
    }
}
