import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Profile | Huấn Cánh Cụt',
    description: 'Profile page',
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
