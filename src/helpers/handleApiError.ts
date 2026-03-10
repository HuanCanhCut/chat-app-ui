import { AxiosError } from 'axios'
import { toast } from 'sonner'

const handleApiError = (error: any, message?: string) => {
    if (error instanceof AxiosError) {
        if (message) {
            toast.error(message)
            return
        }

        if (error.response?.data.message && !error.status?.toString().startsWith('5')) {
            toast.error(error.response?.data.message)
        } else {
            toast.error('Có lỗi xảy ra, vui lòng thử lại sau hoặc liên hệ admin để xử lí')
        }
    } else {
        toast.error(error.message)
    }
}

export default handleApiError
