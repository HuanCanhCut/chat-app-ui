import { Bounce, toast as toastify } from 'react-toastify'

export const toast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'success',
    duration?: number,
) => {
    return toastify[type](message, {
        position: 'top-right',
        autoClose: duration || 2500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        transition: Bounce,
    })
}
