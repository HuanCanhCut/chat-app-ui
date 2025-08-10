import { useCallback, useRef, useState } from 'react'

const useMediaStream = (initialVideo: boolean, initialAudio: boolean = true) => {
    const [isMicOn, setIsMicOn] = useState<boolean>(initialAudio)
    const [isCameraOn, setIsCameraOn] = useState<boolean>(initialVideo)
    const localStreamRef = useRef<MediaStream | null>(null)
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

    // Track the active video sender to avoid duplicates
    const videoSenderRef = useRef<RTCRtpSender | null>(null)

    // Callback để update peer connection khi có track mới
    const onTrackReplaced = useRef<((newTrack: MediaStreamTrack, oldTrack: MediaStreamTrack) => void) | null>(null)

    // Callback để trigger renegotiation từ component cha
    const onNeedRenegotiation = useRef<(() => Promise<void>) | null>(null)

    const getUserMedia = useCallback(
        async (video: boolean = initialVideo, audio: boolean = initialAudio): Promise<MediaStream | null> => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: video,
                    audio: audio,
                })

                localStreamRef.current = stream
                return stream
            } catch (error) {
                console.error('Error getting user media:', error)
                return null
            }
        },
        [initialVideo, initialAudio],
    )

    const toggleMic = useCallback(() => {
        if (localStreamRef.current) {
            const audioTracks = localStreamRef.current.getAudioTracks()
            audioTracks.forEach((track: MediaStreamTrack) => {
                track.enabled = !track.enabled
            })
            setIsMicOn((prev) => !prev)
        }
    }, [])

    const toggleCamera = useCallback(async () => {
        if (!localStreamRef.current || !peerConnectionRef.current) return

        console.log('=== TOGGLE CAMERA START (useMediaStream) ===')
        console.log('Current camera state:', isCameraOn)
        console.log('Current video sender:', videoSenderRef.current)

        if (isCameraOn) {
            // TẮT CAMERA
            const videoTracks = localStreamRef.current.getVideoTracks()
            console.log('Stopping video tracks:', videoTracks.length)

            videoTracks.forEach((track: MediaStreamTrack) => {
                track.stop()
                localStreamRef.current?.removeTrack(track)
            })

            // Replace với null track nếu đã có video sender
            if (videoSenderRef.current && videoSenderRef.current.track) {
                try {
                    await videoSenderRef.current.replaceTrack(null)
                    console.log('Video track replaced with null successfully')
                } catch (error) {
                    console.error('Error replacing video track with null:', error)
                }
            }

            setIsCameraOn(false)
        } else {
            // BẬT CAMERA
            try {
                const newVideoStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                })

                const newVideoTrack = newVideoStream.getVideoTracks()[0]
                if (!newVideoTrack) {
                    console.error('Failed to get new video track')
                    return
                }

                console.log('Got new video track:', newVideoTrack.id)
                localStreamRef.current.addTrack(newVideoTrack)

                // Kiểm tra xem đã có video sender chưa
                if (videoSenderRef.current) {
                    // Đã có video sender, chỉ cần replace track
                    try {
                        await videoSenderRef.current.replaceTrack(newVideoTrack)
                        console.log('Video track replaced successfully with existing sender')
                    } catch (error) {
                        console.error('Error replacing video track:', error)
                        // Fallback: remove sender cũ và tạo mới
                        try {
                            peerConnectionRef.current.removeTrack(videoSenderRef.current)
                            videoSenderRef.current = peerConnectionRef.current.addTrack(
                                newVideoTrack,
                                localStreamRef.current,
                            )
                            console.log('Created new video sender after replace failure')

                            if (onNeedRenegotiation.current) {
                                await onNeedRenegotiation.current()
                            }
                        } catch (removeError) {
                            console.error('Error in fallback sender creation:', removeError)
                        }
                    }
                } else {
                    // Chưa có video sender, tạo mới
                    console.log('Creating new video sender')
                    videoSenderRef.current = peerConnectionRef.current.addTrack(newVideoTrack, localStreamRef.current)

                    // LUÔN trigger renegotiation khi thêm sender mới
                    if (onNeedRenegotiation.current) {
                        console.log('Triggering renegotiation for new video sender')
                        await onNeedRenegotiation.current()
                    }
                }

                // Callback để component có thể xử lý thêm nếu cần
                if (onTrackReplaced.current) {
                    onTrackReplaced.current(newVideoTrack, newVideoTrack)
                }

                setIsCameraOn(true)
            } catch (error) {
                console.error('Error restarting camera:', error)
            }
        }

        console.log('=== TOGGLE CAMERA END (useMediaStream) ===')
    }, [isCameraOn])

    const stopStream = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop())
            localStreamRef.current = null
        }
        // Reset video sender reference
        videoSenderRef.current = null
    }, [])

    // Setter cho peer connection reference
    const setPeerConnection = useCallback((peerConnection: RTCPeerConnection | null) => {
        peerConnectionRef.current = peerConnection

        // Reset video sender reference when peer connection changes
        if (peerConnection) {
            // Tìm video sender hiện có (nếu có)
            const existingSenders = peerConnection.getSenders()
            const existingVideoSender = existingSenders.find((sender) => sender.track && sender.track.kind === 'video')
            videoSenderRef.current = existingVideoSender || null
            console.log('Set peer connection, existing video sender:', !!existingVideoSender)
        } else {
            videoSenderRef.current = null
        }
    }, [])

    // Setter cho callback khi track được thay thế
    const setOnTrackReplaced = useCallback(
        (callback: (newTrack: MediaStreamTrack, oldTrack: MediaStreamTrack) => void) => {
            onTrackReplaced.current = callback
        },
        [],
    )

    // Setter cho callback khi cần renegotiation
    const setOnNeedRenegotiation = useCallback((callback: () => Promise<void>) => {
        onNeedRenegotiation.current = callback
    }, [])

    return {
        isMicOn,
        isCameraOn,
        localStreamRef,
        getUserMedia,
        toggleMic,
        toggleCamera,
        stopStream,
        setPeerConnection,
        setOnTrackReplaced,
        setOnNeedRenegotiation,
    }
}

export default useMediaStream
