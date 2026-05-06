import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Home | Huấn Cánh Cụt',
    description: 'Home page',
}

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
    return <div className="pb-4">{children}</div>
}

export default HomeLayout
