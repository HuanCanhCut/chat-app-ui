'use client'

import Sound from '~/components/GlobalWrapper/Sound'
import { SWRConfig } from 'swr'
import { ToastContainer } from 'react-toastify'
import Socket from './Socket'

const GlobalSWRConfig = ({ children }: { children: React.ReactNode }) => {
    return (
        <SWRConfig
            value={{
                revalidateIfStale: false,
                revalidateOnFocus: false,
                revalidateOnReconnect: false,
                shouldRetryOnError: false,
            }}
        >
            <Socket>
                <Sound>{children}</Sound>
            </Socket>
            <ToastContainer />
        </SWRConfig>
    )
}

export default GlobalSWRConfig
