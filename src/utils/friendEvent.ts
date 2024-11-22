import { sendEvent } from '../helpers/events'
import * as friendService from '~/services/friendService'
import handleApiError from '../helpers/handleApiError'

export const handleAcceptFriend = async (userID: number) => {
    try {
        sendEvent({
            eventName: 'friend:change-friend-status',
            detail: { is_friend: true, friend_request: false },
        })
        return await friendService.acceptFriend(userID)
    } catch (error: any) {
        handleApiError(error)
    }
}

export const handleRejectFriendRequest = async (userID: number) => {
    try {
        sendEvent({
            eventName: 'friend:change-friend-status',
            detail: { is_friend: false, friend_request: false },
        })
        return await friendService.rejectFriend(userID)
    } catch (error: any) {
        handleApiError(error)
    }
}
