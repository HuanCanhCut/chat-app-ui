import { UserModel } from '~/type/type'

interface InitState {
    currentUser: UserModel | null
}

const initialState: InitState = {
    currentUser: null,
}

const authReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case 'set-current-user':
            return {
                ...state,
                currentUser: action.payload,
            }
        case 'log-out':
            return {
                ...state,
                currentUser: null,
            }
        default:
            return state
    }
}

export default authReducer
