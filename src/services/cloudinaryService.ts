import { CloudinarySignatureResponse } from '~/type/cloudinary'
import * as request from '~/utils/httpRequest'

export const createCloudinarySignature = async ({
    folder,
}: {
    folder: string
}): Promise<CloudinarySignatureResponse> => {
    try {
        const response = await request.post('/cloudinary/signature', {
            folder,
        })
        return response.data
    } catch (error) {
        throw error
    }
}
