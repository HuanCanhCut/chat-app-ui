import { BaseModel } from './common.type'
import { UserModel } from './user.type'

export interface SearchHistoryData extends BaseModel {
    user_id: number
    user_search_id: number
    user_search: UserModel
}

export interface SearchHistory {
    data: SearchHistoryData[]
}
