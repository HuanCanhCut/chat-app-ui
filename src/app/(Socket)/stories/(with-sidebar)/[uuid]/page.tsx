'use client'

import React from 'react'

import Story from './components/Story'
import Interaction from '~/layouts/Header/Interaction'

interface StoriesPageProps {
    uuid: string
}

const StoriesPage: React.FC<StoriesPageProps> = ({ uuid }) => {
    return (
        <div className="relative flex h-dvh flex-1 justify-center bg-black py-2">
            <div className="absolute top-2 right-3 z-10">
                <Interaction />
            </div>
            <Story uuid={uuid} />
        </div>
    )
}

export default StoriesPage
