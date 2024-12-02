'use client'

import Header from './layout/Chat/Header'
import Message from './layout/Chat/Message'
import EnterMessage from './layout/Chat/EnterMessage'
import Info from './layout/Info/Info'
import { useState } from 'react'

const MessagePage = () => {
    const [infoOpen, setInfoOpen] = useState(false)

    const toggleInfo = () => {
        setInfoOpen(!infoOpen)
    }

    return (
        <div className="flex h-full">
            <div className="flex flex-grow flex-col">
                <Header toggleInfo={toggleInfo} />
                <Message />
                <EnterMessage />
            </div>
            {infoOpen && (
                <Info className={`${infoOpen ? 'block' : 'hidden'} min-w-[250px] md:block lg:min-w-[280px]`} />
            )}
        </div>
    )
}

export default MessagePage
