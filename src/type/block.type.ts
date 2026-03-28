import { BaseModel } from './common.type'
import { UserModel } from './user.type'

export interface BlockModel extends BaseModel {
    user_id: number
    blockable_id: number
    blockable_type: 'User' | 'Conversation'
    blocker: UserModel
}
