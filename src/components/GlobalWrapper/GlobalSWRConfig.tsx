'use client'

import { SWRConfig } from 'swr'

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
        </SWRConfig>
    )
}

export default GlobalSWRConfig
