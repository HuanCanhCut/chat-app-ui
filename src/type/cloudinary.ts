export interface CloudinarySignature {
    api_key: string
    timestamp: number
    signature: string
    folder: string
    cloud_name: string
}

export interface CloudinarySignatureResponse {
    data: CloudinarySignature
}
