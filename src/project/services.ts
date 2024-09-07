import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface ShowToastProps {
    message: string
    type?: 'success' | 'error' | 'warning' | 'info'
    duration?: number
}

export const showToast = ({ message, type = 'success', duration = 4000 }: ShowToastProps) => {
    return toast[type](message, {
        position: 'top-right',
        autoClose: duration,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
    })
}
