import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Home | Huấn Cánh Cụt',
    description: 'Home page',
}

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
}

export default HomeLayout
