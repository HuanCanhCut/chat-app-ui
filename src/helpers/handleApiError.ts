import { AxiosError } from 'axios'

import { toast } from '../utils/toast'

const handleApiError = (error: any, message?: string) => {
    if (error instanceof AxiosError) {
        if (message) {
            toast(message, 'error')
            return
        }

        if (error.response?.data.message && !error.status?.toString().startsWith('5')) {
            toast(error.response?.data.message, 'error')
        } else {
            toast('Có lỗi xảy ra, vui lòng thử lại sau hoặc liên hệ admin để xử lí', 'error')
        }
    } else {
        toast(error.message, 'error')
    }
}

export default handleApiError
