interface Timestamp {
    createdAt: Date
    updatedAt: Date
}
/**
 * User model
 */
export interface UserModel extends Timestamp {
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
}

interface UserResponse {
    data: UserModel
    meta?: {
        pagination: {
            exp: number
        }
    }
}

/**
 * Conversation model
 */
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

/**
 * Message model
 */

interface MessageModel extends Timestamp {
    id: number
    conversation_id: number
    content: string
    sender_id: number
    sender: UserModel
    message_status: MessageStatus[]
}

interface MessageResponse extends MetaPagination {
    data: MessageModel[]
}

interface MessageStatus extends Timestamp {
    id: number
    message_id: number
    receiver_id: number
    status: 'sent' | 'delivered' | 'read'
    receiver: UserModel
}

/**
 * Friends model
 */

interface FriendsShip {
    id: number
    user_id: number
    friend_id: number
    status: string
    createdAt: Date
    updatedAt: Date
    user: UserModel
}

interface FriendsResponse extends MetaPagination {
    data: FriendsShip[]
}

/**
 * Meta pagination
 */
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

/**
 * Notification model
 */

interface NotificationData {
    id: number
    recipient_id: number
    is_read: boolean
    is_seen: boolean
    message: string
    sender_id: number
    sender_user: UserModel
    type: 'friend_request' | 'accept_friend_request' | 'message'
    createdAt: Date
    updatedAt: Date
}

interface NotificationResponse extends MetaPagination {
    data: NotificationData[]
}

/**
 * Search history model
 */

interface SearchHistoryData {
    id: number
    user_id: number
    user_search_id: number
    user_search: UserModel
}

interface SearchHistory {
    data: SearchHistoryData[]
}

/**
 * Socket model
 */

interface SocketMessage {
    conversation: ConversationModel
}
