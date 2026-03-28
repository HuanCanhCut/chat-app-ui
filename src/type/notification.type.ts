import { BaseModel, MetaPagination } from './common.type'
import { UserModel } from './user.type'

export interface NotificationModel extends BaseModel {
    type: string
    recipient_id: number
    message: string
    is_read?: boolean
    is_seen?: boolean
    actor_id: number
    metadata?: string
    target_type: string
    target_id: number
    actor: UserModel
}

export interface NotificationResponse extends MetaPagination {
    data: NotificationModel[]
}
