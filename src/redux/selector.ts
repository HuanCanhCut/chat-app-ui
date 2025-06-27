import { RootState } from './store'
import { UserResponse } from '~/type/type'

export const getCurrentTheme = (state: RootState) => {
    return state.theme.theme
}

export const getCurrentUser = (state: RootState): UserResponse => {
    return state.auth.currentUser
}
