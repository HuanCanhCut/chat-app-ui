'use client'

import React from 'react'

import Story from './components/Story'
import Interaction from '~/layouts/Header/Interaction'

interface StoriesPageProps {
    isModal?: boolean
}

const StoriesPage: React.FC<StoriesPageProps> = () => {
    return (
        <div className="relative flex h-dvh flex-1 justify-center bg-black py-2">
            <div className="absolute top-2 right-3 z-10">
                <Interaction />
            </div>
            <Story />
        </div>
    )
}

export default StoriesPage
