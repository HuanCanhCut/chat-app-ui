export type AxiosApiError = AxiosError<{ message: string; status_code: number }>

export interface BaseModel {
    id: number
    created_at: Date
    updated_at: Date
}
// ========================================== User model ==========================================
export interface UserModel<K = any, V = any> extends BaseModel {
    first_name: string
    last_name: string
    full_name: string
    uuid: string
    avatar: string
    nickname: string
    cover_photo: string
    friends_count: number
    is_friend: boolean
    friend_request: boolean
    sent_friend_request: boolean
    conversation: ConversationModel
    is_online?: boolean
    last_online_at?: Date
    active_status: boolean
    [key: K]: V
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

// ========================================== Theme model ==========================================

export interface ConversationThemeModel extends BaseModel {
    name: string
    logo: string
    description: string | null
    emoji: string
    theme_config: {
        sender: {
            light: {
                text_color: string
                background_color: string
            }
            dark: {
                text_color: string
                background_color: string
            }
        }
        receiver: {
            light: {
                text_color: string
                background_color: string
            }
            dark: {
                text_color: string
                background_color: string
            }
        }
        background_theme: {
            light: {
                background: string | null
                header_color: string
                footer_color: string
            }
            dark: {
                background: string | null
                header_color: string
                footer_color: string
            }
        }
        emoji: string
    }
}

export interface ConversationThemeResponse extends MetaPagination {
    data: ConversationThemeModel[]
}

export interface BlockModel extends BaseModel {
    user_id: number
    blockable_id: number
    blockable_type: 'User' | 'Conversation'
    blocker: UserModel
}

// ========================================== Conversation model ==========================================
export interface ConversationModel extends BaseModel {
    is_group: boolean
    name?: string
    avatar?: string
    uuid: string
    members: ConversationMember[]
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

// ========================================== Message model ==========================================

export interface TopReaction {
    react: string
    user_reaction: UserModel
}

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
    data: MessageModel[]
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

export interface SearchMessageModel extends MessageModel {
    top_reactions?: never
    parent?: never
}

export interface SearchMessageResponse extends MetaPagination {
    data: SearchMessageModel[]
}

// ========================================== Link preview model ==========================================

export interface LinkPreviewModel {
    originalUrl: string
    title: string
    description: string
    image: string
    author: string
    url: string
    success: boolean
}

export interface LinkPreviewResponse {
    data: LinkPreviewModel[]
    meta: {
        failed: number
        invalidUrls: string[]
        results: LinkPreviewModel[]
        successful: number
        total: number
    }
}

export interface MessageLinksPreviewResponse extends MetaPagination {
    data: LinkPreviewModel[]
}

// ========================================== Message reaction model ==========================================

export interface MessageReactionModel extends BaseModel {
    message_id: number
    user_id: number
    react: string
    user_reaction: UserModel
}

export interface MessageReactionResponse extends MetaPagination {
    data: MessageReactionModel[]
}

// ========================================== Friends model ==========================================

export interface FriendsShip extends BaseModel {
    user_id: number
    friend_id: number
    status: string
    user: UserModel
}

export interface FriendsResponse extends MetaPagination {
    data: FriendsShip[]
}

// ========================================== Meta pagination ==========================================
export interface MetaPagination {
    meta: {
        pagination: {
            total: number
            count: number
            per_page: number
            current_page: number
            total_pages: number
        }
    }
}

// ========================================== Notification model ==========================================

export interface NotificationData extends BaseModel {
    recipient_id: number
    is_read: boolean
    is_seen: boolean
    message: string
    sender_id: number
    sender_user: UserModel
    type: 'friend_request' | 'accept_friend_request' | 'message'
}

export interface NotificationResponse extends MetaPagination {
    data: NotificationData[]
}

// ========================================== Search history model ==========================================

export interface SearchHistoryData extends BaseModel {
    user_id: number
    user_search_id: number
    user_search: UserModel
}

export interface SearchHistory {
    data: SearchHistoryData[]
}

// ========================================== Socket model ==========================================

export interface SocketMessage {
    conversation: ConversationModel
}
