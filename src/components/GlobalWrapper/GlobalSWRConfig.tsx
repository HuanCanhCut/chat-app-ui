'use client'

import { SWRConfig } from 'swr'
import { ToastContainer } from 'react-toastify'

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
            {children}
            <ToastContainer />
        </SWRConfig>
    )
}

export default GlobalSWRConfig
