interface InitState {
    theme: string
}

const initialState: InitState = {
    theme: 'light',
}

const themeReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case 'set-theme':
            return {
                ...state,
                theme: action.payload,
            }
        default:
            return state
    }
}

export default themeReducer
