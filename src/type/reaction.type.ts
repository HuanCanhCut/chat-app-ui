import { BaseModel, MetaPagination } from './common.type'
import { UserModel } from './user.type'

export interface MessageReactionModel extends BaseModel {
    reactionable_id: number
    reactionable_type: 'Message' | 'Comment' | 'Post'
    user_id: number
    react: string
    user_reaction: UserModel
}

export interface MessageReactionResponse extends MetaPagination {
    data: MessageReactionModel[]
}
