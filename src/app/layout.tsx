import { Inter } from 'next/font/google'
import { ToastContainer } from 'react-toastify'

import ReduxProvider from '~/redux/reduxProvider'
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
                <ReduxProvider>
                    <GetCurrentUser>{children}</GetCurrentUser>
                    <ToastContainer />
                </ReduxProvider>
            </body>
        </html>
    )
}

export default RootLayout
