import { BaseModel, MetaPagination } from './common.type'
import { UserModel } from './user.type'

export interface FriendsShip extends BaseModel {
    user_id: number
    friend_id: number
    status: string
    user: UserModel
}

export interface FriendInvitationResponse extends MetaPagination {
    data: FriendsShip[]
}

export interface FriendsResponse extends MetaPagination {
    data: FriendsShip[]
}
