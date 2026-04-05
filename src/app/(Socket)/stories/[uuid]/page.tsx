'use client'

import SidebarStory from './components/Sidebar/SidebarStory'
import Interaction from '~/layouts/Header/Interaction'

interface StoriesPageProps {
    isModal?: boolean
}

const StoriesPage: React.FC<StoriesPageProps> = ({ isModal = false }) => {
    return (
        <div className="flex">
            <SidebarStory isModal={isModal} />

            <div className="relative h-dvh flex-1 bg-black">
                <div className="absolute top-2 right-3">
                    <Interaction />
                </div>
            </div>
        </div>
    )
}

export default StoriesPage
