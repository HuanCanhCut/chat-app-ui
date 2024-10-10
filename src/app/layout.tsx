'use client'

import { Inter } from 'next/font/google'
import { ToastContainer } from 'react-toastify'
import { SWRConfig } from 'swr'

const inter = Inter({ subsets: ['latin'] })

import './globals.css'
import 'react-loading-skeleton/dist/skeleton.css'
import 'tippy.js/dist/tippy.css'
import useThemeStore from '~/zustand/useThemeStore'

function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const { theme } = useThemeStore()

    return (
        <html lang="en" className={theme}>
            <body className={`${inter.className} text-black dark:text-dark`}>
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
            </body>
        </html>
    )
}

export default RootLayout
