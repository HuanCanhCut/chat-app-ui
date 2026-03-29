'use client'

import { useEffect, useRef } from 'react'
import { Provider } from 'react-redux'

import { setTheme } from '~/redux/slices/themeSlice'
import { getCurrentUser } from '~/redux/slices/userSlice'
import { AppStore, makeStore } from '~/redux/store'

export default function StoreProvider({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<AppStore>(undefined)

    if (!storeRef.current) {
        // Create the store instance the first time this renders
        storeRef.current = makeStore()
    }

    useEffect(() => {
        if (storeRef.current) {
            storeRef.current.dispatch(getCurrentUser)

            const currentTheme = JSON.parse(localStorage.getItem('theme') || '"light"')
            document.documentElement.classList.toggle('dark', currentTheme === 'dark')

            storeRef.current.dispatch(setTheme(currentTheme))
        }
    }, [])

    return <Provider store={storeRef.current}>{children}</Provider>
}
