'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Peer from 'peerjs'
import useSWR from 'swr'

import {
    faChevronRight,
    faMicrophone,
    faMicrophoneSlash,
    faPhone,
    faPhoneSlash,
    faVideo,
    faVideoSlash,
    faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@tippyjs/react'
import UserAvatar from '~/components/UserAvatar'
import { SocketEvent } from '~/enum/SocketEvent'
import SWRKey from '~/enum/SWRKey'
import socket from '~/helpers/socket'
import useMediaStream from '~/hooks/useMediaStream'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import * as userService from '~/services/userService'

type CallStatus =
    | 'connecting'
    | 'calling'
    | 'accepted'
    | 'in_call'
    | 'rejected'
    | 'ended'
    | 'failed'
    | 'timeout'
    | 'busy'

const CALL_TIMEOUT_DURATION = 15000 // 15 seconds

const CallClient = () => {
    const router = useRouter()
    const currentUser = useAppSelector(getCurrentUser)
    const audioRef = useRef<HTMLAudioElement>(null)

    const searchParams = useSearchParams()

    const subType: 'caller' | 'callee' = searchParams.get('sub_type') as 'caller' | 'callee'
    const memberNickname = searchParams.get('member_nickname')
    const initializeVideo = searchParams.get('initialize_video')
    const uuid = searchParams.get('uuid')

    const { data: member } = useSWR(SWRKey.GET_AN_USER, () => {
        return userService.getAnUser(memberNickname as string)
    })

    const peerInstance = useRef<Peer | null>(null)
    const currentCallRef = useRef<any>(null) // Lưu reference của call hiện tại
    const previewRef = useRef<HTMLDivElement>(null)
    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)
    const previewButtonRef = useRef<HTMLButtonElement>(null)
    const callTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Timeout reference

    const [callStatus, setCallStatus] = useState<CallStatus>('connecting')
    const [previewOpen, setPreviewOpen] = useState(true)
    const [isCalling, setIsCalling] = useState(false)
    const [isRemoteVideoVisible, setIsRemoteVideoVisible] = useState(true)
    const [memberBusy, setMemberBusy] = useState(false)

    const {
        isMicOn,
        isCameraOn,
        localStreamRef,
        getUserMedia,
        toggleMic,
        toggleCamera,
        setPeerConnection,
        setOnTrackReplaced,
        setOnNeedRenegotiation,
        stopStream,
    } = useMediaStream(initializeVideo === 'true')

    // Clear timeout helper
    const clearCallTimeout = useCallback(() => {
        audioRef.current?.pause()

        if (callTimeoutRef.current) {
            clearTimeout(callTimeoutRef.current)
            callTimeoutRef.current = null
        }
    }, [])

    // Start timeout for caller
    const startCallTimeout = useCallback(async () => {
        if (subType === 'caller') {
            try {
                await audioRef.current?.play()
            } catch (error) {}

            callTimeoutRef.current = setTimeout(() => {
                setCallStatus('timeout')

                // Emit cancel event to server
                socket.emit(SocketEvent.END_CALL, {
                    caller_id: currentUser?.data.id,
                    callee_id: member?.data.id,
                    uuid,
                })

                // Clean up resources
                if (localStreamRef.current) {
                    stopStream()
                }

                if (peerInstance.current) {
                    peerInstance.current.destroy()
                }

                if (currentCallRef.current) {
                    currentCallRef.current.close()
                }
            }, CALL_TIMEOUT_DURATION)
        }
    }, [subType, currentUser?.data.id, member?.data.id, uuid, localStreamRef, stopStream])

    // Các hàm khởi tạo và chấp nhận cuộc gọi - đặt ở đây để tránh lỗi "used before declaration"
    const handleInitiateCall = useCallback(() => {
        if (callStatus !== 'connecting') return

        socket.emit(SocketEvent.INITIATE_CALL, {
            caller_id: currentUser?.data.id,
            callee_id: member?.data.id,
            type: initializeVideo === 'true' ? 'video' : 'voice',
            uuid,
        })

        // Start timeout after initiating call
        startCallTimeout()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.data.id, initializeVideo, member?.data.id, startCallTimeout])

    const handleAcceptCall = useCallback(
        (peerId: string) => {
            socket.emit(SocketEvent.ACCEPTED_CALL, {
                caller_id: member?.data.id,
                peer_id: peerId,
                callee_id: currentUser?.data.id,
                uuid,
            })
        },
        [currentUser?.data.id, member?.data.id, uuid],
    )

    // IMPROVED: Cleanup function - remove sender thay vì chỉ remove track
    const cleanupDuplicateSenders = useCallback(() => {
        if (currentCallRef.current?.peerConnection) {
            const pc = currentCallRef.current.peerConnection
            const senders = pc.getSenders()

            // Tìm tất cả video senders (bao gồm cả null track)
            const videoSenders = senders.filter((s: RTCRtpSender) => {
                // Sender có video track hoạt động
                if (s.track && s.track.kind === 'video') return true
                // Sender đã từng có video track (dtmf === null cho video sender)
                if (!s.track && s.dtmf === null) return true
                return false
            })

            // Chỉ giữ lại sender đầu tiên có track, remove hết các sender khác
            const activeSenders = videoSenders.filter((s: RTCRtpSender) => s.track !== null)
            const inactiveSenders = videoSenders.filter((s: RTCRtpSender) => s.track === null)

            // Remove tất cả inactive senders
            inactiveSenders.forEach((sender: RTCRtpSender, index: number) => {
                try {
                    pc.removeTrack(sender)
                } catch (error) {
                    console.error(`Error removing inactive sender ${index}:`, error)
                }
            })

            // Nếu có nhiều hơn 1 active sender, chỉ giữ lại cái đầu tiên
            if (activeSenders.length > 1) {
                console.warn('Detected multiple active video senders, cleaning up...')
                for (let i = 1; i < activeSenders.length; i++) {
                    try {
                        pc.removeTrack(activeSenders[i])
                    } catch (error) {
                        console.error(`Error removing duplicate active sender ${i}:`, error)
                    }
                }
            }
        }
    }, [])

    // Custom toggle camera
    const handleToggleCamera = useCallback(async () => {
        await toggleCamera()
    }, [toggleCamera])

    useEffect(() => {
        if (!previewRef.current) return

        if (!previewOpen) {
            previewRef.current.style.transform = 'translateX(calc(100% + 20px))'
            previewButtonRef.current?.classList.add('rotate-180', 'translate-x-[-50px]')
        } else {
            previewRef.current.style.transform = 'translateX(0)'
            previewButtonRef.current?.classList.remove('rotate-180', 'translate-x-[-50px]')
        }
    }, [previewOpen])

    // Callback khi video track được thay thế
    useEffect(() => {
        setOnTrackReplaced(() => {
            if (localVideoRef.current && localStreamRef.current) {
                localVideoRef.current.srcObject = localStreamRef.current
            }
        })
    }, [setOnTrackReplaced, localStreamRef])

    // IMPROVED: Renegotiation handler với cleanup tốt hơn
    useEffect(() => {
        const handleRenegotiation = async () => {
            if (peerInstance.current && currentCallRef.current && currentCallRef.current.peerConnection) {
                try {
                    const pc = currentCallRef.current.peerConnection

                    // Cleanup duplicate senders TRƯỚC KHI tạo offer
                    cleanupDuplicateSenders()

                    // Đợi một chút để cleanup hoàn tất
                    await new Promise((resolve) => setTimeout(resolve, 100))

                    // Kiểm tra trạng thái connection với retry mechanism
                    if (pc.signalingState !== 'stable') {
                        // Retry với exponential backoff
                        let retryCount = 0
                        const maxRetries = 5

                        const retryRenegotiation = async () => {
                            retryCount++
                            await new Promise((resolve) => setTimeout(resolve, 100 * Math.pow(2, retryCount - 1)))

                            if (pc.signalingState === 'stable') {
                                await handleRenegotiation()
                            } else if (retryCount < maxRetries) {
                                await retryRenegotiation()
                            } else {
                                console.error('Max retry attempts reached for renegotiation')
                            }
                        }

                        await retryRenegotiation()
                        return
                    }

                    // Tạo và gửi offer
                    const offer = await pc.createOffer()
                    await pc.setLocalDescription(offer)

                    // TODO: Gửi offer mới cho remote peer
                    // Gửi offer mới cho remote peer
                    socket.emit(SocketEvent.RENEGOTIATION_OFFER, {
                        from_user_id: currentUser?.data.id,
                        to_user_id: member?.data.id,
                        caller_id: subType === 'caller' ? currentUser?.data.id : member?.data.id,
                        callee_id: subType === 'callee' ? currentUser?.data.id : member?.data.id,
                        offer: offer,
                    })
                } catch (error) {
                    console.error('Error during renegotiation:', error)
                }
            } else {
                console.warn('Cannot perform renegotiation: missing peer instance or current call')
            }
        }

        setOnNeedRenegotiation(handleRenegotiation)
    }, [setOnNeedRenegotiation, currentUser?.data.id, member?.data.id, subType, cleanupDuplicateSenders])

    // IMPROVED: Xử lý renegotiation events với error handling tốt hơn
    useEffect(() => {
        const handleRenegotiationOffer = async (data: {
            offer: RTCSessionDescriptionInit
            from_user_id: number
            caller_id: number
            callee_id: number
        }) => {
            if (currentCallRef.current && currentCallRef.current.peerConnection) {
                try {
                    const pc = currentCallRef.current.peerConnection

                    // Đợi signaling state ổn định
                    if (pc.signalingState !== 'stable') {
                        let waitCount = 0
                        while (pc.signalingState !== 'stable' && waitCount < 50) {
                            await new Promise((resolve) => setTimeout(resolve, 100))
                            waitCount++
                        }

                        if (pc.signalingState !== 'stable') {
                            console.error('Signaling state did not become stable within timeout')
                            return
                        }
                    }

                    await pc.setRemoteDescription(data.offer)
                    const answer = await pc.createAnswer()
                    await pc.setLocalDescription(answer)

                    // TODO: Gửi answer mới cho remote peer
                    socket.emit(SocketEvent.RENEGOTIATION_ANSWER, {
                        from_user_id: currentUser?.data.id,
                        to_user_id: data.from_user_id,
                        caller_id: data.caller_id,
                        callee_id: data.callee_id,
                        answer: answer,
                    })
                } catch (error) {
                    console.error('Error handling renegotiation offer:', error)
                }
            } else {
                console.warn('Cannot handle renegotiation offer: missing current call')
            }
        }

        const handleRenegotiationAnswer = async (data: {
            answer: RTCSessionDescriptionInit
            from_user_id: number
            caller_id: number
            callee_id: number
        }) => {
            if (currentCallRef.current && currentCallRef.current.peerConnection) {
                try {
                    const pc = currentCallRef.current.peerConnection
                    await pc.setRemoteDescription(data.answer)
                } catch (error) {
                    console.error('Error handling renegotiation answer:', error)
                }
            } else {
                console.warn('Cannot handle renegotiation answer: missing current call')
            }
        }

        socket.on(SocketEvent.RENEGOTIATION_OFFER, handleRenegotiationOffer)
        socket.on(SocketEvent.RENEGOTIATION_ANSWER, handleRenegotiationAnswer)

        return () => {
            socket.off(SocketEvent.RENEGOTIATION_OFFER, handleRenegotiationOffer)
            socket.off(SocketEvent.RENEGOTIATION_ANSWER, handleRenegotiationAnswer)
        }
    }, [currentUser?.data.id])

    const setupRemoteStreamMonitoring = useCallback((remoteStream: MediaStream) => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream
        }

        const updateVideoVisibility = (isVisible: boolean, reason?: string) => {
            setIsRemoteVideoVisible(isVisible)
        }

        // Monitor remote video track status
        const monitorVideoTracks = () => {
            const videoTracks = remoteStream.getVideoTracks()

            if (videoTracks.length > 0) {
                const videoTrack = videoTracks[0]

                // Initial check
                const isVisible = videoTrack.enabled && videoTrack.readyState === 'live' && !videoTrack.muted
                updateVideoVisibility(isVisible, 'initial check')

                // Remove existing listeners to avoid duplicates
                videoTrack.removeEventListener('ended', () => {})
                videoTrack.removeEventListener('mute', () => {})
                videoTrack.removeEventListener('unmute', () => {})

                // Handle track ended (khi bên kia stop track thật sự)
                const handleEnded = () => {
                    updateVideoVisibility(false, 'track ended')
                }

                // Handle mute/unmute (khi chỉ disable/enable)
                const handleMute = () => {
                    updateVideoVisibility(false, 'track muted')
                }

                const handleUnmute = () => {
                    updateVideoVisibility(true, 'track unmuted')
                    // Restore srcObject khi unmute
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream
                    }
                }

                videoTrack.addEventListener('ended', handleEnded)
                videoTrack.addEventListener('mute', handleMute)
                videoTrack.addEventListener('unmute', handleUnmute)

                return () => {
                    videoTrack.removeEventListener('ended', handleEnded)
                    videoTrack.removeEventListener('mute', handleMute)
                    videoTrack.removeEventListener('unmute', handleUnmute)
                }
            } else {
                // Không có video track ban đầu
                updateVideoVisibility(false, 'no video tracks')
                return () => {}
            }
        }

        // Initial monitoring
        let cleanup = monitorVideoTracks()

        // Listen for track changes
        const handleRemoveTrack = (event: MediaStreamTrackEvent) => {
            if (event.track.kind === 'video') {
                updateVideoVisibility(false, 'video track removed')
                // Clean up old listeners
                if (cleanup) cleanup()
            }
        }

        const handleAddTrack = (event: MediaStreamTrackEvent) => {
            if (event.track.kind === 'video') {
                // Clean up old listeners
                if (cleanup) cleanup()
                // Set up monitoring for new track
                cleanup = monitorVideoTracks()
                updateVideoVisibility(true, 'new video track added')

                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream
                }
            }
        }

        remoteStream.addEventListener('removetrack', handleRemoveTrack)
        remoteStream.addEventListener('addtrack', handleAddTrack)

        // Return cleanup function
        return () => {
            remoteStream.removeEventListener('removetrack', handleRemoveTrack)
            remoteStream.removeEventListener('addtrack', handleAddTrack)
            if (cleanup) cleanup()
        }
    }, [])

    useEffect(() => {
        const peer = new Peer({
            host: process.env.NEXT_PUBLIC_PEER_HOST,
            port: Number(process.env.NEXT_PUBLIC_PEER_PORT),
            path: '/peerjs',
            secure: true,
        })

        peer.on('open', (id: string) => {
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
                currentCallRef.current = call

                let streamToAnswer = localStreamRef.current
                if (!streamToAnswer) {
                    streamToAnswer = await getUserMedia()
                }

                call.answer(streamToAnswer)

                // Lưu peer connection reference để có thể replace track sau này
                setPeerConnection(call.peerConnection)

                call.on('stream', (remoteStream: MediaStream) => {
                    setupRemoteStreamMonitoring(remoteStream)
                })

                // Set call status to in_call when connection is established
                call.peerConnection.addEventListener('connectionstatechange', () => {
                    if (call.peerConnection.connectionState === 'connected') {
                        setCallStatus('in_call')
                    }
                })
            })
        }

        // Handle peer errors
        peer.on('error', (error) => {
            setCallStatus('failed')
            clearCallTimeout()
        })

        return () => {
            clearCallTimeout()
            peer.destroy()
        }
    }, [
        getUserMedia,
        handleAcceptCall,
        handleInitiateCall,
        localStreamRef,
        subType,
        setPeerConnection,
        setupRemoteStreamMonitoring,
        clearCallTimeout,
    ])

    // Update local video element when stream changes
    useEffect(() => {
        if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current
        }
    }, [localStreamRef])

    useEffect(() => {
        const socketHandler = (data: { peer_id: string }) => {
            // Clear timeout when call is accepted
            clearCallTimeout()
            setCallStatus('accepted')

            if (localStreamRef.current) {
                setIsCalling(true)

                const call = peerInstance.current?.call(data.peer_id, localStreamRef.current)
                currentCallRef.current = call

                if (call) {
                    // Lưu peer connection reference
                    setPeerConnection(call.peerConnection)

                    call.on('stream', (stream: MediaStream) => {
                        setupRemoteStreamMonitoring(stream)
                    })

                    // Set call status to in_call when connection is established
                    call.peerConnection.addEventListener('connectionstatechange', () => {
                        if (call.peerConnection.connectionState === 'connected') {
                            setCallStatus('in_call')
                        }
                    })
                }
            }
        }

        socket.on(SocketEvent.ACCEPTED_CALL, socketHandler)

        return () => {
            socket.off(SocketEvent.ACCEPTED_CALL, socketHandler)
        }
    }, [localStreamRef, setPeerConnection, setupRemoteStreamMonitoring, clearCallTimeout])

    const handleEndCall = useCallback(
        // chỉ end cuộc gọi với người gọi nếu oneway = true
        (oneWay: boolean = false) => {
            // Clear timeout
            clearCallTimeout()

            // Cập nhật trạng thái cuộc gọi
            setCallStatus('ended')

            // Thông báo cho người đối diện về việc kết thúc cuộc gọi
            if (currentUser?.data.id && member?.data.id) {
                socket.emit(SocketEvent.END_CALL, {
                    caller_id: subType === 'caller' ? currentUser.data.id : member.data.id,
                    callee_id: oneWay ? Math.random() : subType === 'callee' ? currentUser.data.id : member.data.id,
                    uuid,
                })
            }

            // Dừng tất cả các track
            if (localStreamRef.current) {
                stopStream()
            }

            // Đóng kết nối peer
            if (peerInstance.current) {
                peerInstance.current.destroy()
            }

            // Đóng cuộc gọi hiện tại
            if (currentCallRef.current) {
                currentCallRef.current.close()
            }
        },
        [clearCallTimeout, currentUser?.data.id, member?.data.id, localStreamRef, subType, uuid, stopStream],
    )

    useEffect(() => {
        const socketHandler = () => {
            clearCallTimeout()
            setCallStatus('rejected')
        }

        socket.on(SocketEvent.REJECT_CALL, socketHandler)

        return () => {
            socket.off(SocketEvent.REJECT_CALL, socketHandler)
        }
    }, [clearCallTimeout])

    useEffect(() => {
        const socketHandler = () => {
            setMemberBusy(true)
            setCallStatus('busy')
            audioRef.current?.pause()

            setTimeout(() => {
                handleEndCall(true)
            }, 3000)
        }

        socket.on(SocketEvent.CALL_BUSY, socketHandler)

        return () => {
            socket.off(SocketEvent.CALL_BUSY, socketHandler)
        }
    }, [handleEndCall])

    // Handle cancel incoming call event
    useEffect(() => {
        const handleCancelIncomingCall = () => {
            setCallStatus('timeout')

            // Clean up resources
            if (localStreamRef.current) {
                stopStream()
            }

            if (peerInstance.current) {
                peerInstance.current.destroy()
            }

            if (currentCallRef.current) {
                currentCallRef.current.close()
            }
        }

        socket.on(SocketEvent.CANCEL_INCOMING_CALL, handleCancelIncomingCall)

        return () => {
            socket.off(SocketEvent.CANCEL_INCOMING_CALL, handleCancelIncomingCall)
        }
    }, [localStreamRef, stopStream])

    useEffect(() => {
        const init = async () => {
            const stream = await getUserMedia()

            if (localVideoRef.current && stream) {
                localVideoRef.current.srcObject = stream
            }
        }
        init()
    }, [getUserMedia])

    // Xử lý khi nhận được sự kiện kết thúc cuộc gọi từ người đối diện
    useEffect(() => {
        const handleRemoteEndCall = () => {
            // Clear timeout
            clearCallTimeout()

            // Hiển thị thông báo
            setCallStatus('ended')

            // Dừng tất cả các track và đóng kết nối
            if (localStreamRef.current) {
                stopStream()
            }

            if (peerInstance.current) {
                peerInstance.current.destroy()
            }

            // Đóng cuộc gọi hiện tại
            if (currentCallRef.current) {
                currentCallRef.current.close()
            }
        }

        socket.on(SocketEvent.END_CALL, handleRemoteEndCall)

        return () => {
            socket.off(SocketEvent.END_CALL, handleRemoteEndCall)
        }
    }, [localStreamRef, router, stopStream, clearCallTimeout])

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
                return 'Không trả lời.'
            case 'ended':
                return 'Cuộc gọi đã kết thúc'
            case 'failed':
                return 'Cuộc gọi thất bại.'
            case 'timeout':
                return 'Không có phản hồi. Cuộc gọi đã bị hủy.'
            case 'busy':
                return 'Người dùng đang bận.'
            default:
                return ''
        }
    }

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            clearCallTimeout()
        }
    }, [clearCallTimeout])

    // Xử lý khi đóng tab cuộc gọi
    useEffect(() => {
        const handleTabClose = () => {
            // Gọi handleEndCall khi tab đóng
            if (callStatus === 'in_call') {
                handleEndCall(memberBusy)
            }
        }

        window.addEventListener('beforeunload', handleTabClose)

        return () => {
            window.removeEventListener('beforeunload', handleTabClose)
        }
    }, [callStatus, handleEndCall, memberBusy])

    return (
        <div className="relative h-dvh max-h-dvh w-full max-w-full overflow-hidden">
            <audio src="/static/audio/ringbacktone.mp3" ref={audioRef} />
            {subType === 'caller' && !isCalling ? (
                <div className="blur-10 flex-center absolute bottom-0 left-0 right-0 top-0 z-10 backdrop-blur">
                    <div className="flex flex-col items-center gap-2">
                        <UserAvatar src={member?.data.avatar} className="h-20 w-20" />
                        <div className="text-2xl font-bold">{member?.data.nickname}</div>
                        <div className="text-sm text-gray-500">{getStatusMessage()}</div>
                    </div>
                </div>
            ) : null}

            {/* Overlay khi cuộc gọi kết thúc */}
            {(callStatus === 'ended' ||
                callStatus === 'failed' ||
                callStatus === 'rejected' ||
                callStatus === 'timeout') && (
                <div className="blur-10 flex-center absolute bottom-0 left-0 right-0 top-0 z-50 bg-black bg-opacity-80 backdrop-blur">
                    <div className="flex flex-col items-center gap-4 text-white">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500">
                            <FontAwesomeIcon icon={faPhoneSlash} className="text-3xl" />
                        </div>
                        <div className="text-2xl font-bold">{getStatusMessage()}</div>
                    </div>
                    <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 justify-center gap-8">
                        <div className="flex flex-col items-center">
                            <button
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500"
                                onClick={() => {
                                    window.history.replaceState(
                                        {},
                                        '',
                                        `/call?member_nickname=${memberNickname}&initialize_video=false&sub_type=${subType === 'caller' ? 'callee' : 'caller'}`,
                                    )

                                    window.location.reload()
                                }}
                            >
                                <FontAwesomeIcon icon={faPhone} className="text-lg" width={20} height={20} />
                            </button>
                            <p>Gọi lại</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <button
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-500"
                                onClick={() => {
                                    window.close()
                                }}
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-lg" width={20} height={20} />
                            </button>
                            <p>Đóng</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Remote video container */}
            <div className="absolute bottom-0 left-0 right-0 top-0 h-full w-full">
                {/* Fallback when remote video is off */}
                {!isRemoteVideoVisible && (
                    <div
                        className="z-5 absolute inset-0 flex items-center justify-center"
                        style={{
                            backgroundImage: `url(${member?.data.avatar})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div className="flex-center h-full w-full flex-col text-center backdrop-blur-xl backdrop-brightness-[65%]">
                            <UserAvatar src={member?.data.avatar} className="mx-auto mb-4 h-32 w-32" />
                            <div className="text-xl font-semibold text-white">{member?.data.nickname}</div>
                        </div>
                    </div>
                )}

                <video
                    ref={remoteVideoRef}
                    className="h-full w-full object-contain"
                    autoPlay
                    playsInline
                    style={{
                        display: isRemoteVideoVisible ? 'block' : 'none',
                    }}
                />
            </div>

            {/* Control buttons */}
            <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 items-center gap-8">
                <Tippy content={`${isMicOn ? 'Tắt mic' : 'Bật mic'}`} placement="top">
                    <button
                        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                            !isMicOn ? 'bg-white text-dark' : 'bg-white/30 hover:bg-white/40'
                        }`}
                        onClick={toggleMic}
                    >
                        {isMicOn ? (
                            <FontAwesomeIcon
                                icon={faMicrophone}
                                className="text-base text-white"
                                width={16}
                                height={16}
                            />
                        ) : (
                            <FontAwesomeIcon
                                icon={faMicrophoneSlash}
                                className="text-base text-black"
                                width={16}
                                height={16}
                            />
                        )}
                    </button>
                </Tippy>

                <Tippy content={`${isCameraOn ? 'Tắt camera' : 'Bật camera'}`} placement="top">
                    <button
                        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                            !isCameraOn ? 'bg-white text-dark' : 'bg-white/30 hover:bg-white/40'
                        }`}
                        onClick={handleToggleCamera}
                    >
                        {isCameraOn ? (
                            <FontAwesomeIcon icon={faVideo} className="text-base text-white" width={16} height={16} />
                        ) : (
                            <FontAwesomeIcon
                                icon={faVideoSlash}
                                className="text-base text-black"
                                width={16}
                                height={16}
                            />
                        )}
                    </button>
                </Tippy>

                <Tippy content="Kết thúc cuộc gọi" placement="top">
                    <button
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 transition-colors duration-200 hover:bg-red-600"
                        onClick={() => {
                            handleEndCall(memberBusy)
                        }}
                    >
                        <FontAwesomeIcon icon={faPhoneSlash} className="text-base text-white" width={16} height={16} />
                    </button>
                </Tippy>
            </div>

            {/* Local video preview */}
            <div
                ref={previewRef}
                className="absolute bottom-auto right-[20px] top-[20px] z-10 h-[30%] max-w-[calc(100dvw-40px)] rounded-xl transition-all duration-300 ease-in-out [aspect-ratio:10/16] md:!top-auto md:bottom-[20px] md:aspect-video md:w-[300px] lg:w-[350px]"
                style={{
                    backgroundImage: `url(${currentUser?.data.avatar})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <button
                    ref={previewButtonRef}
                    className="flex-center absolute left-2 top-4 z-10 h-7 w-7 transform !cursor-pointer rounded-full bg-opacity-50 p-2 transition duration-200 ease-in-out hover:bg-opacity-70 xxs:h-9 xxs:w-9 md:top-1/2 md:h-10 md:w-10 md:-translate-y-1/2"
                    onClick={() => setPreviewOpen(!previewOpen)}
                >
                    <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-xl text-white md:text-3xl"
                        width={20}
                        height={20}
                    />
                </button>

                {/* Always show video element but conditionally show placeholder */}
                <video
                    ref={localVideoRef}
                    className="h-full w-full rounded-xl object-cover"
                    autoPlay
                    muted
                    playsInline
                    style={{
                        display: isCameraOn ? 'block' : 'none',
                    }}
                />

                {!isCameraOn && (
                    <div
                        className="absolute inset-0 flex h-full w-full items-center justify-center rounded-xl"
                        style={{
                            backgroundImage: `url(${currentUser?.data.avatar})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div className="flex-center h-full w-full flex-col rounded-xl text-center backdrop-blur-xl backdrop-brightness-[65%]">
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
