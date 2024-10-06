'use client'

import { Inter } from 'next/font/google'
import { ToastContainer } from 'react-toastify'
import { SWRConfig } from 'swr'

import GetCurrentUser from './getCurrentUser'
const inter = Inter({ subsets: ['latin'] })

import './globals.css'
import 'react-loading-skeleton/dist/skeleton.css'
import 'tippy.js/dist/tippy.css'
import { useEffect } from 'react'
import useThemeStore from '~/zustand/useThemeStore'

function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const { theme } = useThemeStore()

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        }
    }, [theme])

    return (
        <html lang="en">
            <body className={inter.className}>
                <SWRConfig
                    value={{
                        revalidateIfStale: false,
                        revalidateOnFocus: false,
                        revalidateOnReconnect: false,
                        shouldRetryOnError: false,
                    }}
                >
                    <GetCurrentUser>{children}</GetCurrentUser>
                    <ToastContainer />
                </SWRConfig>
            </body>
        </html>
    )
}

export default RootLayout
