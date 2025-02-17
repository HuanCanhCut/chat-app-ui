'use client'

import { useEffect, useRef } from 'react'
import socket from '~/helpers/socket'
import { SocketEvent } from '~/enum/SocketEvent'
import { getCurrentUser } from '~/redux/selector'
import { useAppSelector } from '~/redux'
import { SocketMessage } from '~/type/type'

const Sound = ({ children }: { children: React.ReactNode }) => {
    const currentUser = useAppSelector(getCurrentUser)

    const audioRef = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        socket.on(SocketEvent.NEW_NOTIFICATION, async () => {
            try {
                if (!audioRef.current) return
                audioRef.current.src = '/static/audio/notify.mp3'
                await audioRef.current?.play()
            } catch (e) {}
        })
    }, [])

    // listen new message event
    useEffect(() => {
        if (!currentUser) return
        socket.on(SocketEvent.NEW_MESSAGE, async (data: SocketMessage) => {
            try {
                if (!audioRef.current) return

                if (data.conversation.last_message.sender_id === currentUser?.data.id) return

                audioRef.current.src = '/static/audio/new-message.mp3'
                await audioRef.current?.play()
            } catch (error) {}
        })
    }, [currentUser])

    return (
        <>
            <audio ref={audioRef} src="" id="notification-sound" />
            {children}
        </>
    )
}

export default Sound
