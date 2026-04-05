import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Stories | HuanCanhCut',
    description: 'Stories | HuanCanhCut',
}

const StoriesLayout = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
}

export default StoriesLayout
