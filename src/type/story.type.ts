import { BaseModel } from './common.type'
import { ReactionModel } from './reaction.type'
import { UserModel } from './user.type'

export interface StoryModel extends BaseModel {
    user_id: number
    url: string
    type: 'video' | 'image' | 'text'
    background_url: string
    is_viewed: boolean
    uuid: string
    unviewed_count: number
    user: UserModel
}

export interface StoryWithReactions extends StoryModel {
    reactions: ReactionModel[]
}
