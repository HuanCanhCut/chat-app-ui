import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'User Huấn Cánh Cụt',
    description: 'User page',
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>
}
