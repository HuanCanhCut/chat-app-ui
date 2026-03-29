import themeReducer from './slices/themeSlice'
import userReducer from './slices/userSlice'
import { configureStore } from '@reduxjs/toolkit'

export const makeStore = () => {
    return configureStore({
        reducer: {
            user: userReducer,
            theme: themeReducer,
        },
    })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
