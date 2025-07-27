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
    userId,
    nickname,
}: {
    uuid: string
    userId: number
    nickname: string
}) => {
    try {
        const response = await request.patch(`/conversations/${uuid}/nickname`, {
            user_id: userId,
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

export const designateLeader = async ({ uuid, userId }: { uuid: string; userId: number }) => {
    try {
        const response = await request.patch(`/conversations/${uuid}/designate-leader`, { user_id: userId })
        return response.data
    } catch (error: any) {
        throw error
    }
}

export const removeLeader = async ({ uuid, userId }: { uuid: string; userId: number }) => {
    try {
        const response = await request.patch(`/conversations/${uuid}/remove-leader`, { user_id: userId })
        return response.data
    } catch (error: any) {
        throw error
    }
}

export const removeMember = async ({ uuid, memberId }: { uuid: string; memberId: number }) => {
    try {
        const response = await request.del(`/conversations/${uuid}/user/${memberId}`)
        return response.data
    } catch (error: any) {
        throw error
    }
}

export const addMember = async ({ uuid, formData }: { uuid: string; formData: FormData }) => {
    try {
        const response = await request.post(`/conversations/${uuid}/user`, formData)
        return response.data
    } catch (error: any) {
        throw error
    }
}

export const blockConversation = async ({ uuid }: { uuid: string }) => {
    try {
        const response = await request.post(`/conversations/${uuid}/block`)
        return response.data
    } catch (error: any) {
        throw error
    }
}
