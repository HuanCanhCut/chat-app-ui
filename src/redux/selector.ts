import type { RootState } from './store'

export const selectCurrentUser = (state: RootState) => state.user.currentUser
export const selectTheme = (state: RootState) => state.theme.theme
