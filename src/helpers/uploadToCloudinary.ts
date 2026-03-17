import { toast } from 'sonner'

import { CloudinarySignature } from '~/type/cloudinary'

const uploadToCloudinary = async ({
    file,
    signature,
    type,
    toastId,
}: {
    file: File
    signature: CloudinarySignature
    type: string
    toastId?: string
}) => {
    try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('api_key', signature.api_key)
        formData.append('timestamp', `${signature.timestamp}`)
        formData.append('signature', signature.signature)
        formData.append('folder', signature.folder)

        // Upload to Cloudinary
        const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloud_name}/${type}/upload`, {
            method: 'POST',
            body: formData,
        })

        return await uploadResponse.json()
    } catch (_) {
        toast.error('Lỗi khi tải lên file', {
            id: toastId?.toString(),
        })

        return null
    }
}

export default uploadToCloudinary
