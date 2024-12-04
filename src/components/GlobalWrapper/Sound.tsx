'use client'

import { useEffect, useRef } from 'react'
import socket from '~/helpers/socket'
import { NotificationEvent } from '~/enum/notification'
import { ChatEvent } from '~/enum/chat'
import getCurrentUser from '~/zustand/getCurrentUser'
import { SocketMessage } from '~/type/type'

const Sound = ({ children }: { children: React.ReactNode }) => {
    const { currentUser } = getCurrentUser()

    const audioRef = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        socket.on(NotificationEvent.NEW_NOTIFICATION, async () => {
            try {
                if (!audioRef.current) return
                audioRef.current.src = '/static/audio/notify.mp3'
                await audioRef.current?.play()
            } catch (e) {}
        })

        return () => {
            socket.off(NotificationEvent.NEW_NOTIFICATION)
        }
    }, [])

    // listen new message event
    useEffect(() => {
        if (!currentUser) return
        socket.on(ChatEvent.NEW_MESSAGE, async (data: SocketMessage) => {
            try {
                if (!audioRef.current) return

                if (data.conversation.messages[0].sender_id === currentUser?.data.id) return

                console.log({ sender_id: data.conversation.messages[0].sender_id, currentUser: currentUser })

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
