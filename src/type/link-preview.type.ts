import { MetaPagination } from './common.type'

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
