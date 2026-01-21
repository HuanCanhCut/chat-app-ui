import { sendEvent } from '../helpers/events'
import handleApiError from '../helpers/handleApiError'
import * as friendService from '~/services/friendService'

export const handleAcceptFriend = async (userID: number, nickname: string) => {
    try {
        sendEvent('FRIEND:CHANGE-FRIEND-STATUS', { is_friend: true, friend_request: false })

        return await friendService.acceptFriend(userID)
    } catch (error) {
        handleApiError(error)
    }
}

export const handleRejectFriendRequest = async (userID: number) => {
    try {
        sendEvent('FRIEND:CHANGE-FRIEND-STATUS', {
            is_friend: false,
            friend_request: false,
        })
        return await friendService.rejectFriend(userID)
    } catch (error) {
        handleApiError(error)
    }
}
