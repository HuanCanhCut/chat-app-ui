import { toast as toastify } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const toast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'success',
    duration?: number,
) => {
    return toastify[type](message, {
        position: 'top-center',
        autoClose: duration || 2500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
    })
}
