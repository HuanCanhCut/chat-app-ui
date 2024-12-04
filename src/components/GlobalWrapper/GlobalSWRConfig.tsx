'use client'

import GetCurrentUser from '~/components/GlobalWrapper/GetCurrentUser'
import Sound from '~/components/GlobalWrapper/Sound'
import { SWRConfig } from 'swr'
import { ToastContainer } from 'react-toastify'
import useThemeStore from '~/zustand/useThemeStore'
import { useEffect } from 'react'
import Socket from './Socket'

const GlobalSWRConfig = ({ children }: { children: React.ReactNode }) => {
    const { theme } = useThemeStore()

    useEffect(() => {
        document.documentElement.classList.add(theme)
    }, [theme])

    return (
        <SWRConfig
            value={{
                revalidateIfStale: false,
                revalidateOnFocus: false,
                revalidateOnReconnect: false,
                shouldRetryOnError: false,
            }}
        >
            <GetCurrentUser>
                <Socket>
                    <Sound>{children}</Sound>
                </Socket>
            </GetCurrentUser>
            <ToastContainer />
        </SWRConfig>
    )
}

export default GlobalSWRConfig
