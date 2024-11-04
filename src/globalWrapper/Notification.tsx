'use client'

import { useEffect, useRef } from 'react'
import socket from '~/utils/socket'

const Notification = ({ children }: { children: React.ReactNode }) => {
    const audioRef = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        socket.on('notification', async () => {
            try {
                await audioRef.current?.play()
            } catch (e) {}
        })

        return () => {
            socket.off('notification')
        }
    }, [])

    return (
        <>
            <audio ref={audioRef} src="/static/audio/notify.mp3" id="notification-sound" />
            {children}
        </>
    )
}

export default Notification
