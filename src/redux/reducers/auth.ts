import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        currentUser: null,
    },
    reducers: {
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload
        },
        removeCurrentUser: (state) => {
            state.currentUser = null
        },
    },
})

export const { setCurrentUser, removeCurrentUser } = authSlice.actions
export default authSlice.reducer
