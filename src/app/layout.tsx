import { Inter } from 'next/font/google'

import './globals.css'
import 'react-loading-skeleton/dist/skeleton.css'
import 'tippy.js/dist/tippy.css'
import 'moment/locale/vi'
import 'react-toastify/dist/ReactToastify.css'
import GlobalSWRConfig from '~/components/GlobalWrapper/GlobalSWRConfig'

const inter = Inter({ subsets: ['latin'] })

function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} text-black dark:text-dark`}>
                <GlobalSWRConfig>{children}</GlobalSWRConfig>
            </body>
        </html>
    )
}

export default RootLayout
