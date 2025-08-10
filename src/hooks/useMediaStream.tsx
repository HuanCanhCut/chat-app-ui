import { useCallback, useRef, useState } from 'react'

const useMediaStream = (initialVideo: boolean, initialAudio: boolean = true) => {
    const [isMicOn, setIsMicOn] = useState<boolean>(initialAudio)
    const [isCameraOn, setIsCameraOn] = useState<boolean>(initialVideo)
    const localStreamRef = useRef<MediaStream | null>(null)

    const getUserMedia = useCallback(
        async (video = isCameraOn, audio = isMicOn): Promise<MediaStream | null> => {
            try {
                // Stop existing stream first
                if (localStreamRef.current) {
                    localStreamRef.current.getTracks().forEach((track) => track.stop())
                    localStreamRef.current = null
                }

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
        [isCameraOn, isMicOn],
    )

    const toggleMic = useCallback(async () => {
        const newMicState = !isMicOn
        setIsMicOn(newMicState)

        // Get new stream with updated audio state
        const newStream = await getUserMedia(isCameraOn, newMicState)
        return newStream
    }, [isMicOn, isCameraOn, getUserMedia])

    const toggleCamera = useCallback(async () => {
        const newCameraState = !isCameraOn
        setIsCameraOn(newCameraState)

        // Get new stream with updated video state
        const newStream = await getUserMedia(newCameraState, isMicOn)
        return newStream
    }, [isCameraOn, isMicOn, getUserMedia])

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
