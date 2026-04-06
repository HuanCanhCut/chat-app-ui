import React, { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Tippy from 'huanpenguin-tippy-react'
import useSWR from 'swr'

import StoryAction from './StoryAction'
import { faPause, faPlay, faVolumeHigh, faVolumeMute } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import baseReactionIcon from '~/common/baseReactionIcon'
import UserAvatar from '~/components/UserAvatar'
import config from '~/config'
import SWRKey from '~/enum/SWRKey'
import * as storyServices from '~/services/storyService'
import { BaseReactionUnified, ReactionModel } from '~/type/reaction.type'
import { StoryModel, StoryWithReactions } from '~/type/story.type'
import getCloudinaryVideoThumbnail from '~/utils/getCloudinaryThumb'
import { momentTimezone } from '~/utils/moment'

const iconMapping = baseReactionIcon(18)

const Story = () => {
    const router = useRouter()
    const { uuid } = useParams()

    const progressRefs = useRef<Record<number, HTMLDivElement>>({})
    const videoRef = useRef<HTMLVideoElement>(null)
    const rafRef = useRef<number>(0)

    const { data: userStories, error } = useSWR(uuid ? [SWRKey.GET_USER_STORIES, uuid] : null, () => {
        return storyServices.getUserStories(uuid as string)
    })

    const [currentStory, setCurrentStory] = useState<StoryWithReactions | null>(null)
    const [isMuted, setIsMuted] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [reactions, setReactions] = useState<ReactionModel[]>([])

    useEffect(() => {
        if (error) {
            router.push(config.routes.not_found)
        }
    }, [error, router])

    useEffect(() => {
        if (userStories) {
            setCurrentStory(userStories.data[0])
        }
    }, [userStories])

    useEffect(() => {
        return () => {
            stopProgress()
        }
    }, [])

    useEffect(() => {
        if (currentStory) {
            setReactions(currentStory.reactions)
        }
    }, [currentStory])

    useEffect(() => {
        window.addEventListener('visibilitychange', async () => {
            if (document.visibilityState === 'visible') {
                setIsPlaying(true)
                try {
                    await videoRef.current?.play()
                } catch (_) {}
            } else {
                setIsPlaying(false)
                videoRef.current?.pause()
            }
        })
    }, [])

    const startProgress = () => {
        setIsPlaying(true)

        const tick = () => {
            const video = videoRef.current

            if (!video || !currentStory) return

            if (video.duration) {
                const percent = (video.currentTime / video.duration) * 100

                const el = progressRefs.current[currentStory.id]

                if (el) {
                    el.style.width = `${percent}%`
                }
            }

            rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
    }

    const stopProgress = () => {
        cancelAnimationFrame(rafRef.current)
        setIsPlaying(false)
    }

    const handleReactStory = (reactions: ReactionModel[]) => {
        setReactions(reactions)
    }

    return (
        <div className="relative flex max-h-dvh w-full flex-col items-center overflow-hidden rounded-md">
            <div className="relative aspect-9/16 max-w-dvw flex-1 overflow-hidden rounded-lg">
                {currentStory && (
                    <>
                        <div
                            className="absolute inset-0 min-h-0 bg-cover bg-center bg-no-repeat blur-md"
                            style={{ backgroundImage: `url(${getCloudinaryVideoThumbnail(currentStory.url)})` }}
                        />

                        <div className="absolute top-3 right-0 left-0 z-100 px-3">
                            <div className="flex items-center gap-1">
                                {userStories?.data.map((story: StoryModel) => {
                                    return (
                                        <React.Fragment key={story.id}>
                                            <div className="h-1 w-full rounded bg-zinc-400/70">
                                                <div
                                                    ref={(el) => {
                                                        if (el) progressRefs.current[story.id] = el
                                                    }}
                                                    className="h-full rounded bg-white"
                                                    style={{ width: '0%' }}
                                                />
                                            </div>
                                        </React.Fragment>
                                    )
                                })}
                            </div>

                            <div className="mt-3 flex justify-between">
                                <div className="flex items-center gap-2">
                                    <UserAvatar src={currentStory.user.avatar} className="size-10" />
                                    <p className="font-medium">{currentStory.user.full_name}</p>
                                    <span className="text-sm">{momentTimezone(currentStory.created_at)}</span>
                                </div>

                                <div className="flex gap-2">
                                    <Tippy content={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}>
                                        <button
                                            className="size-6 cursor-pointer outline-none"
                                            onClick={() => {
                                                setIsMuted((prev) => !prev)
                                            }}
                                        >
                                            {isMuted ? (
                                                <FontAwesomeIcon icon={faVolumeMute} className="text-xl" />
                                            ) : (
                                                <FontAwesomeIcon icon={faVolumeHigh} className="text-xl" />
                                            )}
                                        </button>
                                    </Tippy>

                                    <Tippy content={isPlaying ? 'Tạm dừng' : 'Phát'}>
                                        <button
                                            className="size-6 cursor-pointer outline-none"
                                            onClick={() => {
                                                setIsPlaying((prev) => !prev)

                                                if (isPlaying) {
                                                    videoRef.current?.pause()
                                                } else {
                                                    try {
                                                        videoRef.current?.play()
                                                    } catch (_) {}
                                                }
                                            }}
                                        >
                                            {isPlaying ? (
                                                <FontAwesomeIcon icon={faPause} className="text-xl" />
                                            ) : (
                                                <FontAwesomeIcon icon={faPlay} className="text-xl" />
                                            )}
                                        </button>
                                    </Tippy>
                                </div>
                            </div>
                        </div>

                        <div className="flex-center relative h-full max-h-full flex-1">
                            {currentStory?.type === 'video' ? (
                                <video
                                    ref={videoRef}
                                    src={currentStory.url}
                                    onPlay={startProgress}
                                    onPause={stopProgress}
                                    onEnded={stopProgress}
                                    className="pointer-events-none w-full object-cover"
                                    autoPlay
                                    muted={isMuted}
                                />
                            ) : null}
                        </div>

                        <div className="absolute bottom-1 left-2">
                            <p className="flex items-center gap-2">
                                <span className="flex items-center gap-1">
                                    {reactions.reverse().map((reaction) => {
                                        const react = reaction.react as BaseReactionUnified

                                        const icon = iconMapping[react]

                                        return <React.Fragment key={reaction.id}>{icon}</React.Fragment>
                                    })}
                                </span>
                                <span className="mr-1 line-clamp-1 truncate whitespace-pre-wrap">
                                    đã gửi cho {currentStory.user.full_name}
                                </span>
                            </p>
                        </div>
                    </>
                )}
            </div>
            {currentStory && <StoryAction story={currentStory} handleReactStory={handleReactStory} />}
        </div>
    )
}

export default Story
