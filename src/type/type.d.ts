interface Timestamp {
    createdAt: Date
    updatedAt: Date
}

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
}

interface ConversationModel extends Timestamp {
    id: number
    is_group: boolean
    name?: string
    avatar?: string
    uuid: string
    conversation_members: ConversationMember[]
}

interface ConversationResponse {
    data: Conversation[]
}

interface ConversationMember extends Timestamp {
    id: number
    user_id: number
    conversation_id: number
    user: UserModel
    joined_at: Date
}

interface UserResponse {
    data: UserModel
    meta?: {
        pagination: {
            exp: number
        }
    }
}

interface FriendsShip {
    id: number
    user_id: number
    friend_id: number
    status: string
    createdAt: Date
    updatedAt: Date
    user: UserModel
}

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

interface FriendsResponse extends MetaPagination {
    data: FriendsShip[]
}

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

interface SearchHistoryData {
    id: number
    user_id: number
    user_search_id: number
    user_search: UserModel
}

interface SearchHistory {
    data: SearchHistoryData[]
}
