interface Timestamp {
    createdAt: Date
    updatedAt: Date
}

export interface UserModel extends Timestamp {
    id: number
    first_name: string
    last_name: string
    full_name: string
    email: string
    uuid: string
    avatar: string
    nickname: string
    cover_photo: string
    friends_count: number
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

interface FriendsResponse {
    data: FriendsShip[]
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
