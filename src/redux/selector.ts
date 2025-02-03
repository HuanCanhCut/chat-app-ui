import { UserResponse } from '~/type/type'
import { RootState } from './store'

export const getCurrentTheme = (state: RootState) => {
    return state.theme.theme
}

export const getCurrentUser = (state: RootState): UserResponse => {
    return state.auth.currentUser
}
