import { BaseModel, MetaPagination } from './common.type'
import { UserModel } from './user.type'

export interface TopReaction {
    react: string
    user_reaction: UserModel
}

export interface MessageMedia extends BaseModel {
    message_id: number
    media_url: string
    media_type: 'image' | 'video'
}

export interface ForwardMessage {
    id: number
    content: string | null
    type: string
}

export interface ForwardStory {
    id: number
    url: string
    type: string
    background_url: string
    user: Pick<UserModel, 'id' | 'full_name'>
}

// Interface chính

export interface MessageModel extends BaseModel {
    conversation_id: number
    content: string | null
    sender_id: number
    sender: UserModel
    message_status: MessageStatus[]
    is_read: boolean
    type: string
    top_reactions?: TopReaction[]
    total_reactions: number
    parent_id: number | null
    parent: MessageModel | null
    media: MessageMedia[]
    forward_type: 'Story' | 'Message' | 'Post' | null
    forward_origin_id: number | null
    forward_origin: ForwardMessage | ForwardStory | null
}

export interface MessageResponse {
    data: MessageModel[]
    meta: {
        pagination: {
            total: number
            count: number
            limit: number
            offset: number
        }
    }
}

export interface MessageImagesResponse extends MetaPagination {
    data: MessageMedia[]
}

export interface MessageStatus extends BaseModel {
    message_id: number
    receiver_id: number
    status: 'sent' | 'delivered' | 'read' | 'sending'
    receiver: UserModel & { last_read_message_id: number }
    is_revoked: boolean
    revoke_type: 'for-other' | 'for-me'
    read_at: Date
}

export interface SearchMessageResponse extends MetaPagination {
    data: MessageModel[]
}
