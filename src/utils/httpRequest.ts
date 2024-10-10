import axios, { AxiosResponse } from 'axios'
import { showToast } from '~/project/services'

const request = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    withCredentials: true,
})

// once refresh token
let refreshTokenRequest: null | Promise<AxiosResponse<any, any>> = null

const refreshToken = async () => {
    return await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh`, {
        withCredentials: true,
    })
}

// interceptors refresh token
request.interceptors.request.use(
    async (config) => {
        const tokenExpired = localStorage.getItem('exp')

        if (!tokenExpired) {
            return config
        }

        if (Number(tokenExpired) < Math.floor(Date.now() / 1000)) {
            try {
                refreshTokenRequest = refreshTokenRequest ? refreshTokenRequest : refreshToken()

                const response = await refreshTokenRequest

                localStorage.setItem('exp', response?.data?.exp)
                refreshTokenRequest = null
            } catch (error: any) {
                console.log(error)

                if (error.response.status === 401) {
                    showToast({
                        message: 'Refresh token đã hết hạn, vui lòng đăng nhập lại',
                        type: 'warning',
                    })
                }
                localStorage.removeItem('exp')
            }
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

export const get = async (path: string, options = {}) => {
    const response = await request.get(path, options)
    return response
}

export const post = async (path: string, data: any = {}, options = {}) => {
    const response = await request.post(path, data, options)
    return response
}

export const patch = async (path: string, data: any = {}, options = {}) => {
    const response = await request.patch(path, data, options)
    return response
}

export const deleteMethod = async (path: string, options = {}) => {
    const response = await request.delete(path, options)
    return response
}

export default request
