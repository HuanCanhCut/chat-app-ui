import { LOG_OUT, SET_ACTIVE_STATUS, SET_CURRENT_USER } from '../constant'
import { UserResponse } from '~/type/type'

interface InitState {
    currentUser: UserResponse | null
}

const initialState: InitState = {
    currentUser: null,
}

const authReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case SET_CURRENT_USER:
            return {
                ...state,
                currentUser: action.payload,
            }
        case LOG_OUT:
            return {
                ...state,
                currentUser: null,
            }
        case SET_ACTIVE_STATUS:
            return {
                ...state,
                currentUser: {
                    ...state.currentUser,
                    data: { ...state.currentUser?.data, active_status: action.payload },
                },
            }
        default:
            return state
    }
}

export default authReducer
