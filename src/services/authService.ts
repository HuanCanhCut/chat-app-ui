import { AxiosResponse } from 'axios'
import { UserModel } from '~/type/type'
import * as request from '~/utils/httpRequest'

interface RegisterProps {
    email: string
    password: string
}

interface Response {
    data: UserModel
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
