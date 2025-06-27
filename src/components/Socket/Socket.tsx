'use client'

import { useEffect } from 'react'

import socket from '~/helpers/socket'

const Socket = ({ children }: { children: React.ReactNode }) => {
    // connect to socket
    useEffect(() => {
        socket.connect()

        return () => {
            socket.disconnect()
        }
    }, [])

    return <>{children}</>
}

export default Socket
