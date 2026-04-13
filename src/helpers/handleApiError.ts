import { AxiosError } from 'axios'
import { toast } from 'sonner'

const handleApiError = (error: any, message?: string, toastId?: string | number) => {
    if (error instanceof AxiosError) {
        if (message) {
            toast.error(message, {
                id: toastId,
            })
            return
        }

        if (error.response?.data.message && !error.status?.toString().startsWith('5')) {
            toast.error(error.response?.data.message, { id: toastId })
        } else {
            toast.error('Có lỗi xảy ra, vui lòng thử lại sau hoặc liên hệ admin để xử lí', {
                id: toastId,
            })
        }
    } else {
        toast.error(error.message, {
            id: toastId,
        })
    }
}

export default handleApiError
