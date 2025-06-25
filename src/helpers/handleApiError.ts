import { toast } from '../utils/toast'

const handleApiError = (error: any, message?: string) => {
    if (message) {
        toast(message, 'error')
        return
    }

    if (error?.response?.data?.message) {
        toast(error.response.data.message, 'error')
    } else {
        toast('Có lỗi xảy ra, vui lòng thử lại sau hoặc liên hệ admin để xử lí', 'error')
    }
}

export default handleApiError
