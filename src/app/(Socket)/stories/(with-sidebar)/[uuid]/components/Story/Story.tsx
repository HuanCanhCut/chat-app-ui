import React, { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Tippy from 'huanpenguin-tippy-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import useSWR from 'swr'

import StoryAction from './StoryAction'
import { faPause, faPlay, faVolumeHigh, faVolumeMute } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import baseReactionIcon from '~/common/baseReactionIcon'
import { Button } from '~/components/ui/button'
import UserAvatar from '~/components/UserAvatar'
import config from '~/config'
import SWRKey from '~/enum/SWRKey'
import * as storyServices from '~/services/storyService'
import { BaseReactionUnified, ReactionModel } from '~/type/reaction.type'
import { StoryModel, StoryWithReactions } from '~/type/story.type'
import getCloudinaryVideoThumbnail from '~/utils/getCloudinaryThumb'
import { momentTimezone } from '~/utils/moment'

const iconMapping = baseReactionIcon(18)

const PER_PAGE = 10

const Story = () => {
    const router = useRouter()
    const { uuid } = useParams()

    const progressRefs = useRef<Record<number, HTMLDivElement>>({})
    const videoRef = useRef<HTMLVideoElement>(null)
    const rafRef = useRef<number>(0)
    const isAnimatingRef = useRef(false)

    const { data: stories } = useSWR(SWRKey.GET_STORIES, () => {
        return storyServices.getStories({ page: 1, per_page: PER_PAGE })
    })

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

    const hasNextStory = () => {
        if (!userStories || !stories) return false

        const currentIndex = userStories.data.findIndex((story) => story.id === currentStory?.id)
        const currentUserStoryIndex = stories.data.findIndex((story) => story.user_id === currentStory?.user_id)

        return currentIndex < userStories.data.length - 1 || currentUserStoryIndex < stories.data.length - 1
    }

    const hasPrevStory = () => {
        if (!userStories || !stories) return false

        const currentIndex = userStories.data.findIndex((story) => story.id === currentStory?.id)
        const currentUserStoryIndex = stories.data.findIndex((story) => story.user_id === currentStory?.user_id)

        return currentIndex > 0 || currentUserStoryIndex > 0
    }

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
        if (isAnimatingRef.current) return

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
        isAnimatingRef.current = false
        setIsPlaying(false)
    }

    const handleReactStory = (reactions: ReactionModel[]) => {
        setReactions(reactions)
    }

    const handlePrevStory = () => {
        if (!userStories) {
            return
        }

        if (!hasPrevStory()) {
            return
        }

        stopProgress()

        const currentIndex = userStories.data.findIndex((story) => story.id === currentStory?.id)

        if (currentIndex === 0) {
            // go to prev user stories
            if (stories) {
                const currentUserStoryIndex = stories.data.findIndex((story) => story.user_id === currentStory?.user_id)

                if (currentUserStoryIndex > 0) {
                    const prevUserStories = stories.data[currentUserStoryIndex - 1]

                    router.push(`${config.routes.stories.replace(':uuid', prevUserStories.uuid)}`)
                }
            }
        } else {
            const progress = progressRefs.current[currentStory!.id]
            if (progress) {
                progress.style.width = '0%'
            }

            const prevStory = userStories.data[currentIndex - 1]
            setCurrentStory(prevStory)
        }
    }

    const handleNextStory = () => {
        if (!userStories) {
            return
        }

        if (!hasNextStory()) {
            return
        }

        stopProgress()

        const currentIndex = userStories.data.findIndex((story) => story.id === currentStory?.id)

        if (currentIndex === userStories.data.length - 1) {
            // go to next user stories
            if (stories) {
                const currentUserStoryIndex = stories.data.findIndex((story) => story.user_id === currentStory?.user_id)

                if (currentUserStoryIndex < stories.data.length - 1) {
                    const nextUserStories = stories.data[currentUserStoryIndex + 1]

                    router.push(`${config.routes.stories.replace(':uuid', nextUserStories.uuid)}`)
                }
            }
        } else {
            const progress = progressRefs.current[currentStory!.id]
            if (progress) {
                progress.style.width = '0%'
            }

            const nextStory = userStories.data[currentIndex + 1]
            setCurrentStory(nextStory)
        }
    }

    return (
        <div className="relative flex max-h-dvh w-full flex-col items-center overflow-hidden rounded-md">
            {currentStory && (
                <div className="flex h-full w-full items-center justify-between overflow-hidden">
                    <div className="h-full flex-1 cursor-pointer">
                        {hasPrevStory() && (
                            <div className="group relative h-full w-full" onClick={handlePrevStory}>
                                <Button
                                    variant={'ghost'}
                                    size={'icon-lg'}
                                    className="flex-center absolute top-1/2 right-8 size-12 -translate-y-1/2 rounded-full transition-all duration-200 group-hover:-translate-x-1 group-hover:bg-zinc-200 group-hover:dark:bg-zinc-700"
                                >
                                    <ChevronLeft className="size-7" />
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="relative aspect-9/16 h-full max-w-dvw overflow-hidden rounded-lg">
                        <>
                            <div
                                className="absolute inset-0 min-h-0 bg-cover bg-center bg-no-repeat blur-md"
                                style={{ backgroundImage: `url(${getCloudinaryVideoThumbnail(currentStory.url)})` }}
                            />

                            <div className="absolute top-3 right-0 left-0 z-100 px-3">
                                <div className="flex items-center gap-1">
                                    {userStories?.data.map((story: StoryModel, index: number) => {
                                        const currentStoryIndex = userStories.data.findIndex(
                                            (story) => story.id === currentStory?.id,
                                        )

                                        return (
                                            <React.Fragment key={story.id}>
                                                <div className="h-1 w-full rounded bg-zinc-400/70">
                                                    <div
                                                        ref={(el) => {
                                                            if (el) progressRefs.current[story.id] = el
                                                        }}
                                                        className="h-full rounded bg-white"
                                                        style={{ width: index < currentStoryIndex ? '100%' : '0%' }}
                                                    />
                                                </div>
                                            </React.Fragment>
                                        )
                                    })}
                                </div>

                                <div className="mt-3 flex justify-between">
                                    <div className="flex items-center gap-2">
                                        <UserAvatar src={currentStory.user.avatar} className="size-10" />
                                        <p className="font-medium text-white dark:text-white">
                                            {currentStory.user.full_name}
                                        </p>
                                        <span className="text-sm text-white dark:text-white">
                                            {momentTimezone(currentStory.created_at)}
                                        </span>
                                    </div>

                                    <div className="flex gap-2 text-white dark:text-white">
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
                                        key={currentStory.id}
                                        ref={videoRef}
                                        src={currentStory.url}
                                        onPlay={startProgress}
                                        onPause={stopProgress}
                                        onEnded={handleNextStory}
                                        className="pointer-events-none w-full object-cover"
                                        autoPlay
                                        muted={isMuted}
                                    />
                                ) : null}
                            </div>

                            {reactions.length > 0 && (
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
                            )}
                        </>
                    </div>
                    <div className="h-full flex-1 cursor-pointer">
                        {hasNextStory() && (
                            <div className="group relative h-full w-full" onClick={handleNextStory}>
                                <Button
                                    variant={'ghost'}
                                    size={'icon-lg'}
                                    className="flex-center absolute top-1/2 left-8 size-12 -translate-y-1/2 rounded-full transition-all duration-200 group-hover:translate-x-1 group-hover:bg-zinc-200 group-hover:dark:bg-zinc-700"
                                >
                                    <ChevronRight className="size-7" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {currentStory && <StoryAction story={currentStory} handleReactStory={handleReactStory} />}
        </div>
    )
}

export default Story
