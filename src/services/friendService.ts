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

export const unfriend = async (userId: number): Promise<string | undefined> => {
    try {
        const response = await request.deleteMethod(`users/${userId}/unfriend`)

        return response.data
    } catch (error: any) {
        console.log(error)
    }
}

export const addFriend = async (userId: number): Promise<string | undefined> => {
    try {
        const response = await request.post(`users/${userId}/add`)

        return response.data
    } catch (error: any) {
        console.log(error)
    }
}

export const cancelFriendRequest = async (userId: number): Promise<string | undefined> => {
    try {
        const response = await request.post(`users/${userId}/cancel`)

        return response.data
    } catch (error: any) {
        console.log(error)
    }
}

export const acceptFriend = async (userId: number): Promise<string | undefined> => {
    try {
        const response = await request.post(`users/${userId}/accept`)

        return response.data
    } catch (error) {
        console.log(error)
    }
}

export const rejectFriend = async (userId: number): Promise<string | undefined> => {
    try {
        const response = await request.post(`users/${userId}/reject`)

        return response.data
    } catch (error) {
        console.log(error)
    }
}
