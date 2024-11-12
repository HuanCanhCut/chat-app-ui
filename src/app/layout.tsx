'use client'

import { Inter } from 'next/font/google'
import { ToastContainer } from 'react-toastify'
import { SWRConfig } from 'swr'

import useThemeStore from '~/zustand/useThemeStore'
import Notification from '~/components/GlobalWrapper/Notification'

import './globals.css'
import 'react-loading-skeleton/dist/skeleton.css'
import 'tippy.js/dist/tippy.css'
import 'moment/locale/vi'
import 'react-toastify/dist/ReactToastify.css'

const inter = Inter({ subsets: ['latin'] })
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
                    <Notification>{children}</Notification>
                    <ToastContainer />
                </SWRConfig>
            </body>
        </html>
    )
}

export default RootLayout
