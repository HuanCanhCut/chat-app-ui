import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'User | Huấn Cánh Cụt',
    description: 'User page',
}

const UserLayout = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
}

export default UserLayout
