import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './reducers/auth'

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'], // Chỉ giữ lại state auth trong local storage
}

// Combine reducers
const rootReducer = combineReducers({
    auth: authReducer,
})

// Sử dụng persistedReducer để lưu trữ trong local storage
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Hàm tạo store
const makeStore = () =>
    configureStore({
        reducer: persistedReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
                    ignoredPaths: ['persist.persistent'],
                },
            }),
    })

export const store = makeStore()
