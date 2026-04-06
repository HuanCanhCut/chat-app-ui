import { BlockModel } from './block.type'
import { BaseModel, MetaPagination } from './common.type'
import { MessageModel } from './message.type'
import { ConversationThemeModel } from './theme.type'
import { UserModel } from './user.type'

export interface ConversationModel extends BaseModel {
    is_group: boolean
    is_temp?: boolean
    name?: string
    avatar?: string
    uuid: string
    members?: ConversationMember[]
    last_message: MessageModel
    emoji: string
    theme_id: number
    theme: ConversationThemeModel
    block_conversation: BlockModel
}

export interface ConversationResponse extends MetaPagination {
    data: ConversationModel[]
}

export interface ConversationMember extends BaseModel {
    user_id: number
    conversation_id: number
    nickname: string | null
    role: 'admin' | 'leader' | 'member'
    user: UserModel
    joined_at: Date
    added_by?: UserModel
    added_by_id?: number
    deleted_at: Date | null
}
