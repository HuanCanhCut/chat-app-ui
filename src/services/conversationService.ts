import { ConversationModel, ConversationResponse } from '~/type/type'
import * as request from '~/utils/httpRequest'

export const getConversations = async ({
    page,
    per_page = 15,
}: {
    page: number
    per_page?: number
}): Promise<ConversationResponse | undefined> => {
    try {
        const response = await request.get('/conversations', {
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

export const getConversationByUuid = async ({
    uuid,
}: {
    uuid: string
}): Promise<{ data: ConversationModel } | undefined> => {
    try {
        const response = await request.get(`/conversations/${uuid}`)
        return response.data
    } catch (error: any) {
        throw error
    }
}

export const searchConversation = async ({ q }: { q: string }): Promise<ConversationResponse | undefined> => {
    try {
        const response = await request.get(`/conversations/search`, { params: { q } })
        return response.data
    } catch (error: any) {
        throw error
    }
}

export const renameConversation = async ({ uuid, name }: { uuid: string; name: string }) => {
    try {
        const response = await request.patch(`/conversations/${uuid}/rename`, { name })
        return response.data
    } catch (error: any) {
        throw error
    }
}

export const changeConversationAvatar = async ({ uuid, data }: { uuid: string; data: FormData }) => {
    try {
        const response = await request.patch(`/conversations/${uuid}/avatar`, data)

        return response.data
    } catch (error: any) {
        throw error
    }
}

export const changeConversationMemberNickname = async ({
    uuid,
    memberId,
    nickname,
}: {
    uuid: string
    memberId: number
    nickname: string
}) => {
    try {
        const response = await request.patch(`/conversations/${uuid}/nickname`, {
            member_id: memberId,
            nickname,
        })
        return response.data
    } catch (error: any) {
        throw error
    }
}

export const changeConversationEmoji = async ({ uuid, emoji }: { uuid: string; emoji: string }) => {
    try {
        const response = await request.patch(`/conversations/${uuid}/emoji`, { emoji })
        return response.data
    } catch (error: any) {
        throw error
    }
}
