import { AxiosError } from 'axios'

export type AxiosApiError = AxiosError<{ message: string; status_code: number }>

export interface BaseModel {
    id: number
    created_at: Date
    updated_at: Date
}

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
