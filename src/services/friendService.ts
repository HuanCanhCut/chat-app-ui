import * as request from '~/utils/httpRequest'

export const unfriend = async (userId: number) => {
    try {
        return await request.deleteMethod(`users/${userId}/unfriend`)
    } catch (error: any) {
        return error
    }
}
