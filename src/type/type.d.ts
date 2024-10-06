interface Timestamp {
    create_at: Date
    updated_at: Date
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
    friend_count: number
}

export interface UserResponse {
    data: UserModel
    meta: {
        exp: number
    }
}
