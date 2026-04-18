import { BaseModel } from './common.type'
import { BaseReactionUnified, ReactionModel } from './reaction.type'
import { UserModel } from './user.type'

export interface CommentModel extends BaseModel {
    post_id: number
    user_id: number
    content: string
    parent_id: number | null
    deleted_at: Date
}

export interface CommentResponse extends CommentModel {
    user: UserModel
    parent: CommentModel | null
    reaction_count: number
    top_reactions?: (Pick<ReactionModel, 'reactionable_id'> & { react: BaseReactionUnified })[]
    react: BaseReactionUnified | null
}
