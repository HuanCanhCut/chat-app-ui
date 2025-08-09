'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Peer from 'peerjs'
import useSWR from 'swr'

import {
    faChevronLeft,
    faChevronRight,
    faMicrophone,
    faMicrophoneSlash,
    faPhoneSlash,
    faVideo,
    faVideoSlash,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from '~/components/Button'
import UserAvatar from '~/components/UserAvatar'
import { SocketEvent } from '~/enum/SocketEvent'
import SWRKey from '~/enum/SWRKey'
import socket from '~/helpers/socket'
import useMediaStream from '~/hooks/useMediaStream'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import * as userService from '~/services/userService'

type CallStatus = 'connecting' | 'calling' | 'accepted' | 'in_call' | 'rejected' | 'ended' | 'failed'

const CallClient = () => {
    const currentUser = useAppSelector(getCurrentUser)

    const searchParams = useSearchParams()

    const subType: 'caller' | 'callee' = searchParams.get('sub_type') as 'caller' | 'callee'
    const memberNickname = searchParams.get('member_nickname')
    const initializeVideo = searchParams.get('initialize_video')

    const { data: member } = useSWR(SWRKey.GET_AN_USER, () => {
        return userService.getAnUser(memberNickname as string)
    })

    const peerInstance = useRef<Peer | null>(null)

    const previewRef = useRef<HTMLDivElement>(null)
    const [callStatus, setCallStatus] = useState<CallStatus>('connecting')

    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)

    const [previewOpen, setPreviewOpen] = useState(true)

    const { isMicOn, isCameraOn, localStreamRef, getUserMedia } = useMediaStream(initializeVideo === 'true')

    useEffect(() => {
        if (!previewRef.current) return

        if (!previewOpen) {
            previewRef.current.style.right = '-20%'
        } else {
            previewRef.current.style.right = '20px'
        }
    }, [previewOpen])

    const handleInitiateCall = useCallback(() => {
        socket.emit(SocketEvent.INITIATE_CALL, {
            caller_id: currentUser?.data.id,
            callee_id: member?.data.id,
            type: initializeVideo === 'true' ? 'video' : 'voice',
        })
    }, [currentUser?.data.id, initializeVideo, member?.data.id])

    const handleAcceptCall = useCallback(
        (peerId: string) => {
            socket.emit(SocketEvent.ACCEPTED_CALL, {
                caller_id: member?.data.id,
                peer_id: peerId,
            })
        },
        [member?.data.id],
    )

    useEffect(() => {
        const peer = new Peer({
            host: process.env.NEXT_PUBLIC_PEER_HOST,
            port: Number(process.env.NEXT_PUBLIC_PEER_PORT),
            path: '/peerjs',
            secure: true,
        })

        peer.on('open', (id: string) => {
            console.log('My peer ID is:', id)

            peerInstance.current = peer

            switch (subType) {
                case 'caller':
                    handleInitiateCall()
                    break
                case 'callee':
                    handleAcceptCall(id)
                    break
            }
        })

        if (subType === 'callee') {
            peer.on('call', (call: any) => {
                call.answer(localStreamRef.current)

                call.on('stream', (remoteStream: MediaStream) => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream
                    }
                })
            })
        }

        return () => {
            peer.destroy()
        }
    }, [handleAcceptCall, handleInitiateCall, localStreamRef, subType])

    // Update local video element when stream changes
    useEffect(() => {
        if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current
        }
    }, [localStreamRef])

    useEffect(() => {
        const socketHandler = (data: { peer_id: string }) => {
            setCallStatus('accepted')

            if (localStreamRef.current) {
                const call = peerInstance.current?.call(data.peer_id, localStreamRef.current)

                call?.on('stream', (stream: MediaStream) => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = stream
                    }
                })
            }
        }

        socket.on(SocketEvent.ACCEPTED_CALL, socketHandler)

        return () => {
            socket.off(SocketEvent.ACCEPTED_CALL, socketHandler)
        }
    }, [localStreamRef])

    useEffect(() => {
        const init = async () => {
            const stream = await getUserMedia()

            if (localVideoRef.current && stream) {
                localVideoRef.current.srcObject = stream
            }
        }
        init()
    }, [getUserMedia])

    const getStatusMessage = () => {
        switch (callStatus) {
            case 'connecting':
                return 'Đang kết nối...'
            case 'calling':
                return 'Đang gọi...'
            case 'accepted':
                return 'Đã chấp nhận, đang kết nối...'
            case 'in_call':
                return 'Đang trong cuộc gọi'
            case 'rejected':
                return 'Cuộc gọi bị từ chối'
            case 'ended':
                return 'Cuộc gọi đã kết thúc'
            case 'failed':
                return 'Cuộc gọi thất bại'
            default:
                return ''
        }
    }

    return (
        <div className="relative h-dvh max-h-dvh w-full max-w-full overflow-hidden">
            {subType === 'caller' ? (
                <div className="blur-10 flex-center absolute bottom-0 left-0 right-0 top-0 z-10 backdrop-blur">
                    <div className="flex flex-col items-center gap-2">
                        <UserAvatar src={member?.data.avatar} className="h-20 w-20" />
                        <div className="text-2xl font-bold">{member?.data.nickname}</div>
                        <div className="text-sm text-gray-500">{getStatusMessage()}</div>
                    </div>
                </div>
            ) : null}

            <video
                ref={remoteVideoRef}
                className="absolute bottom-0 left-0 right-0 top-0 h-full w-full object-cover"
                autoPlay
                playsInline
            ></video>
            <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 items-center gap-8">
                <button className="flex h-10 w-10 items-center justify-center rounded-full p-6">
                    <FontAwesomeIcon
                        icon={isMicOn ? faMicrophone : faMicrophoneSlash}
                        width={32}
                        className="text-3xl"
                        height={32}
                    />
                </button>

                <button className="flex h-10 w-10 items-center justify-center rounded-full p-6">
                    <FontAwesomeIcon
                        icon={isCameraOn ? faVideo : faVideoSlash}
                        width={32}
                        className="text-3xl"
                        height={32}
                    />
                </button>

                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 p-6">
                    <FontAwesomeIcon icon={faPhoneSlash} width={32} className="text-3xl" height={32} />
                </button>
            </div>
            <div
                ref={previewRef}
                className="absolute bottom-10 right-[20px] z-10 aspect-video w-[350px] max-w-[calc(100dvw-40px)] overflow-hidden rounded-xl transition-all duration-300 ease-in-out"
            >
                <Button
                    buttonType="icon"
                    className="absolute left-2 top-1/2 z-10 -translate-y-1/2 !cursor-pointer bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
                    onClick={() => setPreviewOpen(!previewOpen)}
                >
                    <FontAwesomeIcon
                        icon={previewOpen ? faChevronRight : faChevronLeft}
                        width={32}
                        className="text-3xl"
                        height={32}
                    />
                </Button>

                <video ref={localVideoRef} className="w-full" autoPlay muted playsInline></video>
            </div>
        </div>
    )
}

export default CallClient
