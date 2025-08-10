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
    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)

    const [callStatus, setCallStatus] = useState<CallStatus>('connecting')
    const [previewOpen, setPreviewOpen] = useState(true)
    const [isCalling, setIsCalling] = useState(false)
    const [isRemoteVideoVisible, setIsRemoteVideoVisible] = useState(true)

    const { isMicOn, isCameraOn, localStreamRef, getUserMedia, toggleMic, toggleCamera } = useMediaStream(
        initializeVideo === 'true',
    )

    useEffect(() => {
        if (!previewRef.current) return

        if (!previewOpen) {
            previewRef.current.style.transform = 'translateX(calc(100% - 20px))'
        } else {
            previewRef.current.style.transform = 'translateX(0)'
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
            peer.on('call', async (call: any) => {
                let streamToAnswer = localStreamRef.current

                if (!streamToAnswer) {
                    streamToAnswer = await getUserMedia()
                }

                call.answer(streamToAnswer)

                call.on('stream', (remoteStream: MediaStream) => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream
                    }

                    // Monitor remote video track status
                    const videoTracks = remoteStream.getVideoTracks()
                    if (videoTracks.length > 0) {
                        const videoTrack = videoTracks[0]

                        // Listen for track events
                        const checkTrackStatus = () => {
                            setIsRemoteVideoVisible(videoTrack.enabled && videoTrack.readyState === 'live')
                        }

                        // Initial check
                        checkTrackStatus()

                        // Monitor track changes
                        videoTrack.addEventListener('ended', checkTrackStatus)
                        videoTrack.addEventListener('mute', () => setIsRemoteVideoVisible(false))
                        videoTrack.addEventListener('unmute', () => setIsRemoteVideoVisible(true))

                        // Polling check every second for enabled status
                        const interval = setInterval(checkTrackStatus, 1000)

                        return () => {
                            clearInterval(interval)
                            videoTrack.removeEventListener('ended', checkTrackStatus)
                            videoTrack.removeEventListener('mute', checkTrackStatus)
                            videoTrack.removeEventListener('unmute', checkTrackStatus)
                        }
                    }
                })
            })
        }

        return () => {
            peer.destroy()
        }
    }, [getUserMedia, handleAcceptCall, handleInitiateCall, localStreamRef, subType])

    // Update local video element when stream changes
    useEffect(() => {
        if (localVideoRef.current && localStreamRef.current) {
            console.log('Setting local video stream:', localStreamRef.current)
            localVideoRef.current.srcObject = localStreamRef.current
        }
    }, [localStreamRef])

    useEffect(() => {
        const socketHandler = (data: { peer_id: string }) => {
            setCallStatus('accepted')

            if (localStreamRef.current) {
                setIsCalling(true)

                const call = peerInstance.current?.call(data.peer_id, localStreamRef.current)

                call?.on('stream', (stream: MediaStream) => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = stream
                    }

                    // Monitor remote video track status
                    const videoTracks = stream.getVideoTracks()
                    if (videoTracks.length > 0) {
                        const videoTrack = videoTracks[0]

                        // Listen for track events
                        const checkTrackStatus = () => {
                            setIsRemoteVideoVisible(videoTrack.enabled && videoTrack.readyState === 'live')
                        }

                        // Initial check
                        checkTrackStatus()

                        // Monitor track changes
                        videoTrack.addEventListener('ended', checkTrackStatus)
                        videoTrack.addEventListener('mute', () => setIsRemoteVideoVisible(false))
                        videoTrack.addEventListener('unmute', () => setIsRemoteVideoVisible(true))

                        // Polling check every second for enabled status
                        const interval = setInterval(checkTrackStatus, 1000)

                        setTimeout(() => clearInterval(interval), 300000) // Stop after 5 minutes
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
            console.log('Initial stream:', stream)

            if (localVideoRef.current && stream) {
                localVideoRef.current.srcObject = stream
                console.log('Local video element srcObject set')
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
            {subType === 'caller' && !isCalling ? (
                <div className="blur-10 flex-center absolute bottom-0 left-0 right-0 top-0 z-10 backdrop-blur">
                    <div className="flex flex-col items-center gap-2">
                        <UserAvatar src={member?.data.avatar} className="h-20 w-20" />
                        <div className="text-2xl font-bold">{member?.data.nickname}</div>
                        <div className="text-sm text-gray-500">{getStatusMessage()}</div>
                    </div>
                </div>
            ) : null}

            {/* Remote video container */}
            <div className="absolute bottom-0 left-0 right-0 top-0 h-full w-full">
                {/* Fallback when remote video is off */}
                {!isRemoteVideoVisible && (
                    <div className="z-5 absolute inset-0 flex items-center justify-center bg-gray-900">
                        <div className="text-center">
                            <UserAvatar src={member?.data.avatar} className="mx-auto mb-4 h-32 w-32" />
                            <div className="text-xl font-semibold text-white">{member?.data.nickname}</div>
                            <div className="mt-2 text-sm text-gray-400">Camera đã tắt</div>
                        </div>
                    </div>
                )}

                <video
                    ref={remoteVideoRef}
                    className="h-full w-full object-cover"
                    autoPlay
                    playsInline
                    style={{
                        display: isRemoteVideoVisible ? 'block' : 'none',
                    }}
                />
            </div>

            {/* Control buttons */}
            <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 items-center gap-8">
                <button
                    className={`flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200 ${
                        !isMicOn ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 bg-opacity-80 hover:bg-gray-600'
                    }`}
                    onClick={toggleMic}
                >
                    <FontAwesomeIcon
                        icon={isMicOn ? faMicrophone : faMicrophoneSlash}
                        className="text-2xl text-white"
                    />
                </button>

                <button
                    className={`flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200 ${
                        !isCameraOn ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 bg-opacity-80 hover:bg-gray-600'
                    }`}
                    onClick={toggleCamera}
                >
                    <FontAwesomeIcon icon={isCameraOn ? faVideo : faVideoSlash} className="text-2xl text-white" />
                </button>

                <button className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 transition-colors duration-200 hover:bg-red-600">
                    <FontAwesomeIcon icon={faPhoneSlash} className="text-2xl text-white" />
                </button>
            </div>

            {/* Local video preview */}
            <div
                ref={previewRef}
                className="absolute bottom-auto right-[20px] top-[20px] z-10 aspect-video w-[300px] max-w-[calc(100dvw-40px)] overflow-hidden rounded-xl bg-gray-900 transition-all duration-300 ease-in-out md:!top-auto md:bottom-[20px] lg:w-[350px]"
            >
                <Button
                    buttonType="icon"
                    className="absolute left-2 top-1/2 z-10 -translate-y-1/2 !cursor-pointer rounded-full bg-black bg-opacity-50 p-2 hover:bg-opacity-70 dark:bg-black dark:bg-opacity-50 dark:hover:bg-opacity-70"
                    onClick={() => setPreviewOpen(!previewOpen)}
                >
                    <FontAwesomeIcon
                        icon={previewOpen ? faChevronRight : faChevronLeft}
                        className="text-lg text-white"
                    />
                </Button>

                {/* Always show video element but conditionally show placeholder */}
                <video
                    ref={localVideoRef}
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    playsInline
                    style={{
                        display: isCameraOn ? 'block' : 'none',
                    }}
                />

                {!isCameraOn && (
                    <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gray-800">
                        <div className="text-center">
                            <UserAvatar src={currentUser?.data.avatar} className="mx-auto mb-2 h-16 w-16" />
                            <div className="text-sm text-white">Camera tắt</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CallClient
