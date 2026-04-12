import { ReactionableType, ReactionResponse } from '~/type/reaction.type'
import * as request from '~/utils/httpRequest'

interface ReactionTypeResponse {
    react: string
    count: number
}

export const getReactionTypes = async ({
    reactionableId,
    reactionableType,
}: {
    reactionableId: number
    reactionableType: ReactionableType
}): Promise<ReactionTypeResponse[] | undefined> => {
    try {
        const response = await request.get(`reactions/${reactionableId}/${reactionableType}/reaction/types`)

        return response.data
    } catch (error: any) {
        throw error
    }
}

export const getReactions = async ({
    reactionableId,
    reactionableType,
    type,
    page,
    per_page,
}: {
    reactionableId: number
    reactionableType: ReactionableType
    type: string
    page: number
    per_page: number
}): Promise<ReactionResponse | undefined> => {
    try {
        const response = await request.get(`reactions/${reactionableId}/${reactionableType}/reactions`, {
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
