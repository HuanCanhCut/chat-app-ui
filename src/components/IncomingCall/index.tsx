'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import Modal from '../Modal'
import UserAvatar from '../UserAvatar'
import { faPhone, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SocketEvent } from '~/enum/SocketEvent'
import socket from '~/helpers/socket'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import { UserModel } from '~/type/type'

const IncomingCall = ({ children }: { children: React.ReactNode }) => {
    const currentUser = useAppSelector(getCurrentUser)
    const router = useRouter()

    const [incomingCall, setIncomingCall] = useState(false)
    const [caller, setCaller] = useState<UserModel | null>(null)
    const [type, setType] = useState<'video' | 'voice'>('video')

    const handleAcceptCall = () => {
        setIncomingCall(false)

        router.push(
            `/call?member_nickname=${caller?.nickname}&initialize_video=${type === 'video' ? 'true' : 'false'}&sub_type=callee`,
        )
    }

    useEffect(() => {
        const socketHandler = (data: { caller: UserModel; type: 'video' | 'voice' }) => {
            if (data.caller.id === currentUser?.data.id) {
                return
            }

            setIncomingCall(true)
            setCaller(data.caller)
            setType(data.type)
        }

        socket.on(SocketEvent.INITIATE_CALL, socketHandler)

        return () => {
            socket.off(SocketEvent.INITIATE_CALL, socketHandler)
        }
    }, [currentUser?.data.id, setCaller, setIncomingCall])

    useEffect(() => {
        const socketHandler = ({ caller_id }: { caller_id: number }) => {
            if (caller_id === caller?.id) {
                setIncomingCall(false)
            }
        }

        socket.on(SocketEvent.CANCEL_INCOMING_CALL, socketHandler)

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

    return (
        <div>
            {incomingCall && (
                <Modal
                    title="Cuộc gọi đến"
                    popperClassName="w-[400px] max-w-[calc(100dvw-2rem)]"
                    isOpen={incomingCall}
                    onClose={() => setIncomingCall(false)}
                >
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
