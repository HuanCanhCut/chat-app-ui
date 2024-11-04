import { AxiosResponse } from 'axios'
import { NotificationResponse } from '~/type/type'
import * as request from '~/utils/httpRequest'

export const getNotifications = async ({
    page,
    per_page,
    type = 'all',
}: {
    page: number
    per_page: number
    type: 'all' | 'unread'
}): Promise<AxiosResponse<NotificationResponse>> => {
    try {
        return await request.get(`/notifications`, {
            params: {
                page,
                per_page,
                type,
            },
        })
    } catch (error: any) {
        return error
    }
}

export const read = async (notification_id: number): Promise<AxiosResponse<void>> => {
    try {
        return await request.patch(`/notifications/read`, { notification_id })
    } catch (error: any) {
        return error
    }
}

export const seen = async () => {
    try {
        return await request.patch(`/notifications/seen`)
    } catch (error) {
        console.log(error)
    }
}
