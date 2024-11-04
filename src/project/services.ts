import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { sendEvent } from '~/helpers/events'
import * as friendService from '~/services/friendService'

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
