'use client'

import { useEffect } from 'react'
import { SocketEvent } from '~/enum/SocketEvent'
import { sendEvent } from '~/helpers/events'
import socket from '~/helpers/socket'
import { SocketMessage } from '~/type/type'

const Socket = ({ children }: { children: React.ReactNode }) => {
    // connect to socket
    useEffect(() => {
        socket.connect()

        return () => {
            socket.disconnect()
        }
    }, [])

    useEffect(() => {
        socket.on(SocketEvent.NEW_MESSAGE, (data: SocketMessage) => {
            sendEvent({ eventName: 'message:new-message', detail: data })
        })

        return () => {
            socket.off(SocketEvent.NEW_MESSAGE)
        }
    }, [])

    return <>{children}</>
}

export default Socket
