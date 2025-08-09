import { useCallback, useRef, useState } from 'react'

const useMediaStream = (initialVideo: boolean, initialAudio: boolean = true) => {
    const [isMicOn, setIsMicOn] = useState<boolean>(initialAudio)
    const [isCameraOn, setIsCameraOn] = useState<boolean>(initialVideo)
    const localStreamRef = useRef<MediaStream | null>(null)

    const getUserMedia = useCallback(async (): Promise<MediaStream | null> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: isCameraOn,
                audio: isMicOn,
            })

            localStreamRef.current = stream
            return stream
        } catch (error) {
            console.error('Error getting user media:', error)
            return null
        }
    }, [isCameraOn, isMicOn])

    const toggleMic = useCallback(() => {
        if (localStreamRef.current) {
            const audioTracks = localStreamRef.current.getAudioTracks()
            audioTracks.forEach((track: MediaStreamTrack) => {
                track.enabled = !track.enabled
            })
        }
        setIsMicOn((prev) => !prev)
    }, [])

    const toggleCamera = useCallback(() => {
        if (localStreamRef.current) {
            const videoTracks = localStreamRef.current.getVideoTracks()
            videoTracks.forEach((track: MediaStreamTrack) => {
                track.enabled = !track.enabled
            })
        }
        setIsCameraOn((prev) => !prev)
    }, [])

    const stopStream = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop())
            localStreamRef.current = null
        }
    }, [])

    return {
        isMicOn,
        isCameraOn,
        localStreamRef,
        getUserMedia,
        toggleMic,
        toggleCamera,
        stopStream,
    }
}

export default useMediaStream
