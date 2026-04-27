import { BaseModel } from './common.type'
import { BaseReactionUnified, ReactionModel } from './reaction.type'
import { UserModel } from './user.type'

export interface PostModel extends BaseModel {
    user_id: number
    caption: string
    is_public: boolean
    reaction_count: number
    comment_count: number
    share_count: number
}

export interface PostMediaModel extends BaseModel {
    post_id: number
    media_url: string
    media_type: string
}

export interface PostResponse extends PostModel {
    user: UserModel
    post_media: PostMediaModel[]
    top_reactions?: (Pick<ReactionModel, 'reactionable_id'> & { react: BaseReactionUnified })[]
    reaction?: BaseReactionUnified // current user react to post
}

export interface GetPostResponse {
    data: PostResponse[]
    meta: {
        pagination: {
            has_next_page: boolean
            next_cursor?: string
        }
    }
}
