import { AxiosError } from 'axios'

import { toast } from '../utils/toast'

const handleApiError = (error: AxiosError<{ message: string; status_code: number }>, message?: string) => {
    if (message) {
        toast(message, 'error')
        return
    }

    if (error.response?.data.message && !error.status?.toString().startsWith('5')) {
        toast(error.response?.data.message, 'error')
    } else {
        toast('Có lỗi xảy ra, vui lòng thử lại sau hoặc liên hệ admin để xử lí', 'error')
    }
}

export default handleApiError
