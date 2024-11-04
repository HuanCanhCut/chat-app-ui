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
