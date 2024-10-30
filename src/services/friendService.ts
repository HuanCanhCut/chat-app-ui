import * as request from '~/utils/httpRequest'

export const unfriend = async (userId: number) => {
    try {
        return await request.deleteMethod(`users/${userId}/unfriend`)
    } catch (error: any) {
        return error
    }
}

export const addFriend = async (userId: number) => {
    try {
        return await request.post(`users/${userId}/add`)
    } catch (error: any) {
        return error
    }
}

export const cancelFriendRequest = async (userId: number) => {
    try {
        return await request.post(`users/${userId}/cancel`)
    } catch (error: any) {
        return error
    }
}

export const acceptFriend = async (userId: number) => {
    try {
        return await request.post(`users/${userId}/accept`)
    } catch (error) {
        console.log(error)
    }
}

export const rejectFriend = async (userId: number) => {
    try {
        return await request.post(`users/${userId}/reject`)
    } catch (error) {
        console.log(error)
    }
}
