import { Metadata } from 'next'

import SidebarStory from './[uuid]/components/Sidebar/SidebarStory'

export const metadata: Metadata = {
    title: 'Stories | HuanCanhCut',
    description: 'Stories',
}

interface StoryLayoutProps {
    children: React.ReactNode
    isModal?: boolean
}

const StoryLayout = ({ children, isModal = false }: StoryLayoutProps) => {
    return (
        <div className="flex">
            <SidebarStory isModal={isModal} />

            {children}
        </div>
    )
}

export default StoryLayout
