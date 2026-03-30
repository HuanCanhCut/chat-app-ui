import { BaseModel } from './common.type'
import { UserModel } from './user.type'

export interface StoryModel extends BaseModel {
    user_id: number
    url: string
    type: 'video' | 'image' | 'text'
    background_url: string
    is_viewed: boolean
    user: Pick<UserModel, 'id' | 'full_name' | 'avatar'>
}
