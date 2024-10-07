import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Profile',
    description: 'Profile page',
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>
}
