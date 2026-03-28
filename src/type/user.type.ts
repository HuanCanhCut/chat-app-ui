import { BaseModel } from './common.type'
import { ConversationModel } from './conversation.type'

export interface UserModel extends BaseModel {
    first_name: string
    last_name: string
    full_name: string
    uuid: string
    avatar: string
    nickname: string
    cover_photo: string
    friends_count: number
    mutual_friends_count: number
    is_friend: boolean
    friend_request: boolean
    sent_friend_request: boolean
    conversation: ConversationModel
    is_online?: boolean
    last_online_at?: Date
    active_status: boolean
    [key: string]: any
}

export interface UserResponse {
    data: UserModel
    meta?: {
        pagination: {
            exp: number
        }
    }
}

export interface UserStatus {
    user_id: number
    is_online?: boolean
    last_online_at?: string
}
