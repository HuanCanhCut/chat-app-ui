'use client'

import { useEffect } from 'react'

import SidebarStory from './[uuid]/components/Sidebar/SidebarStory'

interface StoryLayoutProps {
    children: React.ReactNode
    isModal?: boolean
}

const StoryLayout = ({ children, isModal = false }: StoryLayoutProps) => {
    useEffect(() => {
        document.title = 'Story | HuanCanhCut'
    }, [])

    return (
        <div className="flex">
            <SidebarStory isModal={isModal} />

            {children}
        </div>
    )
}

export default StoryLayout
