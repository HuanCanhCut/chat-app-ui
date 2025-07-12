import axios from 'axios'

const request = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    withCredentials: true,
})
let isRefreshing = false
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }[] = []

const processQueue = (error: unknown) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve('')
        }
    })

    failedQueue = []
}

const refreshToken = async () => {
    try {
        await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh`, {
            withCredentials: true,
        })

        processQueue(null)
    } catch (error) {
        processQueue(error)
        throw error
    }
}

const getNewToken = async () => {
    if (isRefreshing) {
        // if isRefreshing is true, push next failed request to queue
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
        })
    }

    isRefreshing = true

    try {
        await refreshToken()
        isRefreshing = false
        return
    } catch (error) {
        isRefreshing = false
        throw error
    }
}

request.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        const shouldRenewToken =
            error.response?.status === 401 &&
            !originalRequest._retry &&
            error.response.headers['x-refresh-token-required'] === 'true'

        if (shouldRenewToken) {
            originalRequest._retry = true

            try {
                await getNewToken()

                return request(originalRequest)
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError)
                return Promise.reject(refreshError)
            }
        }

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

export const del = async (path: string, options = {}) => {
    const response = await request.delete(path, options)
    return response
}

export default request
