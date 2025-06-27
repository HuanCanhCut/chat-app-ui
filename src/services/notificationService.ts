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

export const markAsRead = async (notification_id: number): Promise<AxiosResponse<void>> => {
    try {
        return await request.patch(`/notifications/mark-as-read`, { notification_id })
    } catch (error: any) {
        throw error
    }
}

export const seen = async (): Promise<AxiosResponse<void>> => {
    try {
        return await request.patch(`/notifications/seen`)
    } catch (error: any) {
        throw error
    }
}

export const markAsUnread = async (notification_id: number): Promise<AxiosResponse<void>> => {
    try {
        return await request.patch(`/notifications/mark-as-unread`, { notification_id })
    } catch (error: any) {
        throw error
    }
}

export const deleteNotification = async (notification_id: number): Promise<AxiosResponse<void>> => {
    try {
        return await request.del(`/notifications/${notification_id}`)
    } catch (error: any) {
        throw error
    }
}
