import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Login | Huấn Cánh Cụt',
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
}

export default RootLayout
