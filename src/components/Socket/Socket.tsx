'use client'

import { useEffect } from 'react'

import socket from '~/helpers/socket'

const Socket = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
        socket.connect()

        // handle document visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                socket.emit('VISIBILITY_CHANGE', {
                    is_visible: false,
                })
            } else {
                socket.emit('VISIBILITY_CHANGE', {
                    is_visible: true,
                })
            }
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    return <>{children}</>
}

export default Socket
