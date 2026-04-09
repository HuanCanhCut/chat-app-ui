import { toast } from 'sonner'

import { CloudinarySignature } from '~/type/cloudinary'

const uploadToCloudinary = async ({
    file,
    signature,
    toastId,
}: {
    file: File
    signature: CloudinarySignature
    toastId?: string
}) => {
    try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('api_key', signature.api_key)
        formData.append('timestamp', `${signature.timestamp}`)
        formData.append('signature', signature.signature)
        formData.append('folder', signature.folder)
        formData.append('transformation', signature.transformation)

        const [fileType] = file.type.split('/')

        // Upload to Cloudinary
        const uploadResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${signature.cloud_name}/${fileType}/upload`,
            {
                method: 'POST',
                body: formData,
            },
        )

        return await uploadResponse.json()
    } catch (error) {
        toast.error('Lỗi khi tải lên file', {
            id: toastId?.toString(),
        })

        return null
    }
}

export default uploadToCloudinary
