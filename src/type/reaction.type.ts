import { BaseModel, MetaPagination } from './common.type'
import { UserModel } from './user.type'

export interface ReactionModel extends BaseModel {
    reactionable_id: number
    reactionable_type: 'Message' | 'Comment' | 'Post'
    user_id: number
    react: string
    user_reaction: UserModel
}

export interface MessageReactionResponse extends MetaPagination {
    data: ReactionModel[]
}

export type BaseReactionUnified = '1f44d' | '2764-fe0f' | '1f602' | '1f970' | '1f62e' | '1f622' | '1f621' // like, tym, haha, thương thương, wow, buồn, phẫn nộ
