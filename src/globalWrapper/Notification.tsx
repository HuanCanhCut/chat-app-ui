'use client'

import { useEffect, useRef } from 'react'
import socket from '~/utils/socket'
import { NotificationEvent } from '~/enum/notification'

const Notification = ({ children }: { children: React.ReactNode }) => {
    const audioRef = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        socket.on(NotificationEvent.NEW_NOTIFICATION, async () => {
            try {
                await audioRef.current?.play()
            } catch (e) {}
        })

        return () => {
            socket.off(NotificationEvent.NEW_NOTIFICATION)
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
