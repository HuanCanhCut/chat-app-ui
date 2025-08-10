import { useCallback, useRef, useState } from 'react'

const useMediaStream = (initialVideo: boolean, initialAudio: boolean = true) => {
    const [isMicOn, setIsMicOn] = useState<boolean>(initialAudio)
    const [isCameraOn, setIsCameraOn] = useState<boolean>(initialVideo)
    const localStreamRef = useRef<MediaStream | null>(null)
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

    // Callback để update peer connection khi có track mới
    const onTrackReplaced = useRef<((newTrack: MediaStreamTrack, oldTrack: MediaStreamTrack) => void) | null>(null)

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
        if (!localStreamRef.current) return

        if (isCameraOn) {
            // TẮT CAMERA THẬT SỰ - Stop video tracks
            const videoTracks = localStreamRef.current.getVideoTracks()

            videoTracks.forEach((track: MediaStreamTrack) => {
                track.stop() // Tắt thật camera, LED sẽ tắt
                localStreamRef.current?.removeTrack(track)
            })

            setIsCameraOn(false)
        } else {
            // BẬT CAMERA LẠI - Tạo video track mới
            try {
                const newVideoStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                })

                const newVideoTrack = newVideoStream.getVideoTracks()[0]

                if (newVideoTrack && localStreamRef.current) {
                    // Thêm track mới vào stream hiện tại
                    localStreamRef.current.addTrack(newVideoTrack)

                    // Nếu có peer connection, thay thế track
                    if (peerConnectionRef.current) {
                        const senders = peerConnectionRef.current.getSenders()
                        const videoSender = senders.find((sender) => sender.track && sender.track.kind === 'video')

                        if (videoSender) {
                            await videoSender.replaceTrack(newVideoTrack)
                        } else {
                            // Nếu chưa có video sender, thêm mới
                            peerConnectionRef.current.addTrack(newVideoTrack, localStreamRef.current)
                        }
                    }

                    // Callback để component có thể xử lý thêm nếu cần
                    if (onTrackReplaced.current) {
                        onTrackReplaced.current(newVideoTrack, newVideoTrack)
                    }

                    setIsCameraOn(true)
                }
            } catch (error) {
                console.error('Error restarting camera:', error)
            }
        }
    }, [isCameraOn])

    const stopStream = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop())
            localStreamRef.current = null
        }
    }, [])

    // Setter cho peer connection reference
    const setPeerConnection = useCallback((peerConnection: RTCPeerConnection | null) => {
        peerConnectionRef.current = peerConnection
    }, [])

    // Setter cho callback khi track được thay thế
    const setOnTrackReplaced = useCallback(
        (callback: (newTrack: MediaStreamTrack, oldTrack: MediaStreamTrack) => void) => {
            onTrackReplaced.current = callback
        },
        [],
    )

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
    }
}

export default useMediaStream
