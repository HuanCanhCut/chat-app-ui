import { UserResponse } from '~/type/type'

export const getCurrentTheme = (state: any) => {
    return state.theme.theme
}

export const getCurrentUser = (state: any): UserResponse => {
    return state.auth.currentUser
}
