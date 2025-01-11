import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './reducers/theme'
import authReducer from './reducers/auth'

export const makeStore = () => {
    return configureStore({
        reducer: {
            theme: themeReducer,
            auth: authReducer,
        },
    })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
