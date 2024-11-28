'use client'

import { useEffect } from 'react'
import { ChatEvent } from '~/enum/chat'
import socket from '~/helpers/socket'

const Socket = ({ children }: { children: React.ReactNode }) => {
    // connect to socket
    useEffect(() => {
        socket.connect()

        return () => {
            socket.disconnect()
        }
    }, [])

    // listen new message event
    useEffect(() => {
        socket.on(ChatEvent.NEW_MESSAGE, (data) => {
            console.log(data)
        })
    }, [])

    return <>{children}</>
}

export default Socket
