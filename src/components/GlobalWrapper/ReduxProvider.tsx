'use client'

import { useEffect, useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '../../redux/store'
import useSWR from 'swr'
import SWRKey from '~/enum/SWRKey'
import * as meServices from '~/services/meService'
import { actions } from '~/redux'
import { useRouter } from 'next/navigation'

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const storeRef = useRef<AppStore>()

    const { data: currentUser } = useSWR(SWRKey.GET_CURRENT_USER, () => {
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

        if (!currentUser) {
            storeRef.current.dispatch(actions.setCurrentUser(null))
            router.push('/auth')
            return
        }

        storeRef.current.dispatch(actions.setCurrentUser(currentUser))
    }, [currentUser, router])

    return <Provider store={storeRef.current}>{children}</Provider>
}
