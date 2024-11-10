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
}): Promise<NotificationResponse | undefined> => {
    try {
        const response = await request.get(`/notifications`, {
            params: {
                page,
                per_page,
                type,
            },
        })

        return response.data
    } catch (error: any) {
        console.log(error)
    }
}

export const markAsRead = async (notification_id: number): Promise<string | undefined> => {
    try {
        const response = await request.patch(`/notifications/mark-as-read`, { notification_id })

        return response.data
    } catch (error: any) {
        console.log(error)
    }
}

export const seen = async (): Promise<string | undefined> => {
    try {
        const response = await request.patch(`/notifications/seen`)

        return response.data
    } catch (error) {
        console.log(error)
    }
}

export const markAsUnread = async (notification_id: number): Promise<string | undefined> => {
    try {
        const response = await request.patch(`/notifications/mark-as-unread`, { notification_id })

        return response.data
    } catch (error: any) {
        console.log(error)
    }
}

export const deleteNotification = async (notification_id: number): Promise<string | undefined> => {
    try {
        const response = await request.deleteMethod(`/notifications/${notification_id}`)

        return response.data
    } catch (error: any) {
        console.log(error)
    }
}
