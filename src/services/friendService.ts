import { AxiosResponse } from 'axios'
import { FriendsResponse } from '~/type/type'
import * as request from '~/utils/httpRequest'

interface GetFriendsProps {
    page?: number
    per_page?: number
    user_id: number
}

export const getFriends = async ({
    page = 1,
    per_page = 10,
    user_id,
}: GetFriendsProps): Promise<AxiosResponse<FriendsResponse>> => {
    try {
        return await request.get(`users/friends`, {
            params: {
                page,
                per_page,
                user_id,
            },
        })
    } catch (error: any) {
        return error
    }
}

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
