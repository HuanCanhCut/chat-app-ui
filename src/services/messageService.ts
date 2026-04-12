import { AxiosResponse } from 'axios'

import { LinkPreviewResponse, MessageImagesResponse, MessageLinksPreviewResponse, MessageResponse } from '~/type/type'
import * as request from '~/utils/httpRequest'

export const getMessages = async ({
    conversationUuid,
    limit = 20,
    offset = 0,
}: {
    conversationUuid: string
    limit?: number
    offset?: number
}): Promise<MessageResponse | undefined> => {
    try {
        const response = await request.get(`messages/${conversationUuid}`, {
            params: {
                limit,
                offset,
            },
        })

        return response.data
    } catch (error: any) {
        throw error
    }
}

export const getMessageImages = async ({
    conversationUuid,
    page,
    per_page = 20,
}: {
    conversationUuid: string
    page: number
    per_page?: number
}): Promise<MessageImagesResponse | undefined> => {
    try {
        const response = await request.get(`messages/${conversationUuid}/images`, {
            params: {
                page,
                per_page,
            },
        })

        return response.data
    } catch (error: any) {
        throw error
    }
}

export const revokeMessage = async ({
    conversationUuid,
    messageId,
    type,
}: {
    conversationUuid: string
    messageId: number
    type: string
}): Promise<AxiosResponse<{ message: string }>> => {
    try {
        return await request.patch('/messages/revoke', {
            conversation_uuid: conversationUuid,
            message_id: messageId,
            revoke_type: type,
        })
    } catch (error) {
        throw error
    }
}

export const getAroundMessages = async ({
    conversationUuid,
    messageId,
    limit,
}: {
    conversationUuid: string
    messageId: number
    limit: number
}): Promise<MessageResponse | undefined> => {
    try {
        const response = await request.get(`messages/${messageId}/around`, {
            params: {
                limit,
                conversation_uuid: conversationUuid,
            },
        })

        return response.data
    } catch (error: any) {
        console.log(error)
    }
}

export const getLinkPreview = async ({ urls }: { urls: string[] }): Promise<LinkPreviewResponse | undefined> => {
    try {
        const response = await request.post('/messages/link-preview', { urls })

        return response.data
    } catch (error: any) {
        throw error
    }
}

export const getMessageLinksPreview = async ({
    conversationUuid,
    page,
    per_page,
}: {
    conversationUuid: string
    page: number
    per_page: number
}): Promise<MessageLinksPreviewResponse | undefined> => {
    try {
        const response = await request.get(`messages/${conversationUuid}/links`, {
            params: {
                page,
                per_page,
            },
        })

        return response.data
    } catch (error: any) {
        throw error
    }
}

export const getUnseenCount = async (): Promise<{ count: number } | undefined> => {
    try {
        const response = await request.get('/messages/unseen-count')
        return response.data
    } catch (error: any) {
        throw error
    }
}
