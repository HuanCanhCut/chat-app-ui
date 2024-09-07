import * as request from '~/utils/httpRequest'

interface RegisterProps {
    email: string
    password: string
}

export const register = async ({ email, password }: RegisterProps) => {
    try {
        return await request.post('/auth/register', {
            email,
            password,
        })
    } catch (error) {
        return error
    }
}

export const login = async ({ email, password }: RegisterProps) => {
    try {
        return await request.post('/auth/login', {
            email,
            password,
        })
    } catch (error) {
        return error
    }
}
