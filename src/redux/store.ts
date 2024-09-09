import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './reducers/auth'

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'],
}

const rootReducer = combineReducers({
    auth: authReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    // Cấu hình để bỏ qua các giá trị không tuần tự hóa
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Bỏ qua các giá trị không tuần tự hóa trong các action
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
                // Bỏ qua các giá trị không tuần tự hóa trong các state
                ignoredPaths: ['persist.persistent'],
            },
        }),
})

export const persistor = persistStore(store)
