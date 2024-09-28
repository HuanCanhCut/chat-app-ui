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

function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    useEffect(() => {
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.classList.add('dark')
        }
    }, [])

    return (
        <html lang="en">
            <body className={inter.className}>
                <SWRConfig
                    value={{
                        revalidateOnFocus: false,
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
