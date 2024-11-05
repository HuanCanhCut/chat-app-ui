import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { sendEvent } from '~/helpers/events'
import * as friendService from '~/services/friendService'

interface ShowToastProps {
    message: string
    type?: 'success' | 'error' | 'warning' | 'info'
    duration?: number
}

export const showToast = ({ message, type = 'success', duration }: ShowToastProps) => {
    return toast[type](message, {
        className: 'custom-toast',
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

export const handleAcceptFriend = async (userID: number) => {
    try {
        sendEvent({
            eventName: 'friend:change-friend-status',
            detail: { is_friend: true, friend_request: false },
        })
        return await friendService.acceptFriend(userID)
    } catch (error) {
        console.log(error)
    }
}
