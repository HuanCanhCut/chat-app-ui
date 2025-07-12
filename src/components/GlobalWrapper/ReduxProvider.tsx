'use client'

import { useEffect, useRef } from 'react'
import { Provider } from 'react-redux'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

import { AppStore, makeStore } from '../../redux/store'
import SWRKey from '~/enum/SWRKey'
import { actions } from '~/redux'
import * as meServices from '~/services/meService'

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const storeRef = useRef<AppStore>()

    const { data: currentUser } = useSWR(SWRKey.GET_CURRENT_USER, async () => {
        return meServices.getCurrentUser()
    })

    if (!storeRef.current) {
        storeRef.current = makeStore()
    }

    useEffect(() => {
        if (!storeRef.current) {
            storeRef.current = makeStore()
        }

        const currentTheme = JSON.parse(localStorage.getItem('theme')!) || 'light'

        storeRef.current.dispatch(actions.setTheme(currentTheme))

        document.documentElement.classList.toggle('dark', currentTheme === 'dark')

        storeRef.current.dispatch(actions.setCurrentUser(currentUser))
    }, [currentUser, router])

    return <Provider store={storeRef.current}>{children}</Provider>
}
