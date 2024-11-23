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
}: GetFriendsProps): Promise<FriendsResponse | undefined> => {
    try {
        const response = await request.get(`users/friends`, {
            params: {
                page,
                per_page,
                user_id,
            },
        })

        return response.data
    } catch (error: any) {
        console.log(error)
    }
}

export const unfriend = async (userId: number, conversation_uuid: string): Promise<AxiosResponse<void>> => {
    try {
        return await request.deleteMethod(`users/${userId}/unfriend`, {
            params: {
                conversation_uuid,
            },
        })
    } catch (error: any) {
        throw error
    }
}

export const addFriend = async (userId: number): Promise<AxiosResponse<void>> => {
    try {
        return await request.post(`users/${userId}/add`)
    } catch (error: any) {
        throw error
    }
}

export const cancelFriendRequest = async (userId: number): Promise<AxiosResponse<void>> => {
    try {
        return await request.post(`users/${userId}/cancel`)
    } catch (error: any) {
        throw error
    }
}

export const acceptFriend = async (userId: number): Promise<AxiosResponse<void>> => {
    try {
        return await request.post(`users/${userId}/accept`)
    } catch (error: any) {
        throw error
    }
}

export const rejectFriend = async (userId: number): Promise<AxiosResponse<void>> => {
    try {
        return await request.post(`users/${userId}/reject`)
    } catch (error: any) {
        throw error
    }
}
