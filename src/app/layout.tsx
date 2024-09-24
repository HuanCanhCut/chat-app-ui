'use client'

import { Inter } from 'next/font/google'
import { ToastContainer } from 'react-toastify'
import { SWRConfig } from 'swr'

import GetCurrentUser from './getCurrentUser'
const inter = Inter({ subsets: ['latin'] })

import './globals.css'

function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
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
