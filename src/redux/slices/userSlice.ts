import type { Dispatch, PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import * as meService from '~/services/meService'
import { UserResponse } from '~/type/user.type'

interface InitialState {
    currentUser: UserResponse | null
}

const initialState: InitialState = {
    currentUser: null,
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setCurrentUser(state, action: PayloadAction<UserResponse | null>) {
            state.currentUser = action.payload
        },

        setActiveStatus(state, action: PayloadAction<boolean>) {
            if (state.currentUser) {
                const newCurrentUser = {
                    ...state.currentUser,
                    data: {
                        ...state.currentUser.data,
                        active_status: action.payload,
                    },
                }

                state.currentUser = newCurrentUser
            }
        },
    },
})

// Action creators are generated for each case reducer function
export const { setCurrentUser, setActiveStatus } = userSlice.actions

export const getCurrentUser = (dispatch: Dispatch) => {
    ;(async () => {
        try {
            const res = await meService.getCurrentUser()

            dispatch(setCurrentUser(res || null))
        } catch (_) {
            dispatch(setCurrentUser(null))
        }
    })()
}

export default userSlice.reducer
