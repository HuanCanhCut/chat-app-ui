interface Timestamp {
    created_at: Date
    updated_at: Date
}
// ========================================== User model ==========================================
export interface UserModel<K = any, V = any> extends Timestamp {
    id: number
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
    is_online: boolean
    last_online_at: Date
    [key: K]: V
}

interface UserResponse {
    data: UserModel
    meta?: {
        pagination: {
            exp: number
        }
    }
}

// ========================================== Conversation model ==========================================
interface ConversationModel extends Timestamp {
    id: number
    is_group: boolean
    name?: string
    avatar?: string
    uuid: string
    conversation_members: ConversationMember[]
    last_message: MessageModel
}

interface ConversationResponse {
    data: ConversationModel[]
}

interface ConversationMember extends Timestamp {
    id: number
    user_id: number
    conversation_id: number
    user: UserModel
    joined_at: Date
}

// ========================================== Message model ==========================================

interface MessageModel extends Timestamp {
    id: number
    conversation_id: number
    content: string
    sender_id: number
    sender: UserModel
    message_status: MessageStatus[]
    is_read: boolean
    type: 'text' | 'image'
    top_reaction?: { react: string; user_reaction_name: string }[]
    total_reactions: number
}

interface MessageResponse extends MetaPagination {
    data: MessageModel[]
}

interface MessageStatus extends Timestamp {
    id: number
    message_id: number
    receiver_id: number
    status: 'sent' | 'delivered' | 'read' | 'sending'
    receiver: UserModel<'last_read_message_id', number> & { last_read_message_id: number }
    read_at: Date
}

// ========================================== Message reaction model ==========================================

interface MessageReactionModel extends Timestamp {
    id: number
    message_id: number
    user_id: number
    react: string
    user_reaction: UserModel
}

interface MessageReactionResponse extends MetaPagination {
    data: MessageReactionModel[]
}

// ========================================== Friends model ==========================================

interface FriendsShip extends Timestamp {
    id: number
    user_id: number
    friend_id: number
    status: string
    user: UserModel
}

interface FriendsResponse extends MetaPagination {
    data: FriendsShip[]
}

// ========================================== Meta pagination ==========================================
interface MetaPagination {
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

interface NotificationData extends Timestamp {
    id: number
    recipient_id: number
    is_read: boolean
    is_seen: boolean
    message: string
    sender_id: number
    sender_user: UserModel
    type: 'friend_request' | 'accept_friend_request' | 'message'
}

interface NotificationResponse extends MetaPagination {
    data: NotificationData[]
}

// ========================================== Search history model ==========================================

interface SearchHistoryData extends Timestamp {
    id: number
    user_id: number
    user_search_id: number
    user_search: UserModel
}

interface SearchHistory {
    data: SearchHistoryData[]
}

// ========================================== Socket model ==========================================

interface SocketMessage {
    conversation: ConversationModel
}
