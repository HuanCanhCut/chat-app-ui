'use client'

import { useEffect, useRef, useState } from 'react'

import Modal from '../Modal'
import UserAvatar from '../UserAvatar'
import { faPhone, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SocketEvent } from '~/enum/SocketEvent'
import socket from '~/helpers/socket'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import { UserModel } from '~/type/type'
import openWindowCall from '~/utils/openWindowCall'

const IncomingCall = ({ children }: { children: React.ReactNode }) => {
    const currentUser = useAppSelector(getCurrentUser)

    const audioRef = useRef<HTMLAudioElement>(null)

    const [incomingCall, setIncomingCall] = useState(false)
    const [caller, setCaller] = useState<UserModel | null>(null)
    const [type, setType] = useState<'video' | 'voice'>('video')
    const [uuid, setUuid] = useState<string>('')

    const handleAcceptCall = () => {
        setIncomingCall(false)

        openWindowCall({
            memberNickname: caller?.nickname,
            type,
            conversationUuid: uuid,
            subType: 'callee',
        })
    }

    useEffect(() => {
        const socketHandler = (data: { caller: UserModel; type: 'video' | 'voice'; uuid: string }) => {
            if (data.caller.id === currentUser?.data.id) {
                return
            }

            setIncomingCall(true)
            setCaller(data.caller)
            setType(data.type)
            setUuid(data.uuid)
        }

        socket.on(SocketEvent.INITIATE_CALL, socketHandler)

        return () => {
            socket.off(SocketEvent.INITIATE_CALL, socketHandler)
        }
    }, [currentUser?.data.id, setCaller, setIncomingCall])

    useEffect(() => {
        const socketHandler = () => {
            setIncomingCall(false)
        }

        socket.on(SocketEvent.CANCEL_INCOMING_CALL, socketHandler)
        socket.on(SocketEvent.END_CALL, socketHandler)

        return () => {
            socket.off(SocketEvent.CANCEL_INCOMING_CALL, socketHandler)
        }
    }, [caller?.id])

    const handleRejectCall = () => {
        setIncomingCall(false)

        socket.emit(SocketEvent.REJECT_CALL, {
            caller_id: caller?.id,
        })
    }

    const handleAfterOpen = async () => {
        try {
            await audioRef.current?.play()
        } catch (error) {}
    }

    const handleAfterClose = () => {
        audioRef.current?.pause()
    }

    return (
        <div>
            {incomingCall && (
                <Modal
                    title="Cuộc gọi đến"
                    popperClassName="w-[400px] max-w-[calc(100dvw-2rem)]"
                    isOpen={incomingCall}
                    onClose={() => setIncomingCall(false)}
                    handleAfterClose={handleAfterClose}
                    handleAfterOpen={handleAfterOpen}
                >
                    <audio src="/static/audio/ringtone.mp3" ref={audioRef} />
                    <div className="mt-4 flex flex-col items-center gap-4">
                        <UserAvatar src={caller?.avatar} size={80} />
                        <h3 className="text-center text-lg font-semibold">{caller?.full_name} đang gọi cho bạn</h3>
                        <div className="flex gap-10">
                            <div className="flex flex-col items-center" onClick={handleRejectCall}>
                                <button className="h-10 w-10 rounded-full bg-red-500 p-2 text-white">
                                    <FontAwesomeIcon icon={faXmark} className="text-xl" />
                                </button>
                                <p className="mt-2 text-center text-xs">Từ chối</p>
                            </div>
                            <div className="flex flex-col items-center" onClick={handleAcceptCall}>
                                <button className="h-10 w-10 rounded-full bg-green-500 p-2 text-white">
                                    <FontAwesomeIcon icon={faPhone} className="text-xl" />
                                </button>
                                <p className="mt-2 text-center text-xs">Chấp nhận</p>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
            {children}
        </div>
    )
}

export default IncomingCall
