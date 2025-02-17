import { AxiosResponse } from 'axios'
import { MessageReactionResponse, MessageResponse } from '~/type/type'
import * as request from '~/utils/httpRequest'

export const getMessages = async ({
    conversationUuid,
    page,
    per_page = 20,
}: {
    conversationUuid: string
    page: number
    per_page?: number
}): Promise<MessageResponse | undefined> => {
    try {
        const response = await request.get(`messages/${conversationUuid}`, {
            params: {
                page,
                per_page,
            },
        })

        return response.data
    } catch (error: any) {
        console.log(error)
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
}): Promise<MessageResponse | undefined> => {
    try {
        const response = await request.get(`messages/${conversationUuid}/images`, {
            params: {
                page,
                per_page,
            },
        })

        return response.data
    } catch (error: any) {
        console.log(error)
    }
}

interface ReactionTypeResponse {
    react: string
    count: number
}

export const getReactionTypes = async ({ messageId }: { messageId: number }): Promise<ReactionTypeResponse[] | undefined> => {
    try {
        const response = await request.get(`messages/${messageId}/reaction/types`)

        return response.data
    } catch (error: any) {
        console.log(error)
    }
}

export const getReactions = async ({
    messageId,
    type,
    page,
    per_page,
}: {
    messageId: number
    type: string
    page: number
    per_page: number
}): Promise<MessageReactionResponse | undefined> => {
    try {
        const response = await request.get(`messages/${messageId}/reactions`, {
            params: {
                type,
                page,
                per_page,
            },
        })

        return response.data
    } catch (error: any) {
        console.log(error)
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
