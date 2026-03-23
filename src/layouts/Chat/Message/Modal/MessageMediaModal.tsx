import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Tippy from 'huanpenguin-tippy-react'
import useSWR from 'swr'

import { faChevronLeft, faChevronRight, faDownload, faPlay, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SWRKey from '~/enum/SWRKey'
import * as messageServices from '~/services/messageService'
import { MessageMedia, MetaPagination } from '~/type/type'

interface MessageImagesModelProps {
    onClose: () => void
    mediaUrl: string
    mediaType: 'image' | 'video'
}

interface MessageImagesModelData {
    data: {
        media_url: string
        media_type: 'image' | 'video'
    }[]
    meta: MetaPagination['meta'] | undefined
}

const PER_PAGE = 30

const MessageImagesModel = ({ onClose, mediaUrl, mediaType }: MessageImagesModelProps) => {
    const { uuid } = useParams()
    const scrollableRef = useRef<HTMLDivElement>(null)
    const mediaRef = useRef<(HTMLImageElement | HTMLVideoElement | null)[]>([])

    const [currentMedia, setCurrentMedia] = useState({
        mediaUrl,
        mediaType,
    })
    const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null)

    const [page, setPage] = useState(1)

    const formatImagesResponse = (media: MessageMedia[]) => {
        return media.map((md) => ({
            media_url: md.media_url,
            media_type: md.media_type,
        }))
    }

    const { data: media, mutate: mutateImages } = useSWR<MessageImagesModelData>(
        uuid ? [SWRKey.GET_MESSAGE_IMAGES, uuid] : null,
        async () => {
            const response = await messageServices.getMessageImages({
                conversationUuid: uuid as string,
                page: page,
                per_page: PER_PAGE,
            })

            return {
                data: response?.data ? formatImagesResponse(response?.data) : [],
                meta: response?.meta,
            }
        },
    )

    useEffect(() => {
        if (media?.data) {
            setSelectedMediaIndex(media?.data.findIndex((m) => m.media_url === mediaUrl))
        }
    }, [media, mediaUrl])

    useEffect(() => {
        if (page === 1) return

        const getMoreImages = async () => {
            const response = await messageServices.getMessageImages({
                conversationUuid: uuid as string,
                page: page,
                per_page: PER_PAGE,
            })

            const newImages = formatImagesResponse(response?.data || [])

            mutateImages(
                {
                    data: [...(media?.data || []), ...newImages],
                    meta: response?.meta,
                },
                { revalidate: false },
            )
        }

        getMoreImages()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, uuid])

    const handleDownload = async () => {
        const fileName = currentMedia.mediaUrl.substring(currentMedia.mediaUrl.lastIndexOf('/') + 1).split('?')[0]

        const response = await fetch(currentMedia.mediaUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    }

    const buttons = [
        {
            icon: <FontAwesomeIcon icon={faDownload} className="text-lg text-white" />,
            label: 'Tải xuống',
            onclick: () => handleDownload(),
        },
        {
            icon: <FontAwesomeIcon icon={faXmark} className="text-lg text-white" />,
            onclick: () => onClose(),
        },
    ]

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement
        const scrollLeft = target.scrollLeft

        if (!scrollableRef.current) return

        if (scrollLeft + scrollableRef.current.offsetWidth >= scrollableRef.current.scrollWidth) {
            if (page >= (media?.meta?.pagination.total_pages || 0)) return
            setPage(page + 1)
        }
    }

    const handleChooseImage = (url: string, index: number) => {
        const target = media?.data?.[index]
        if (!target) return

        setCurrentMedia({
            mediaUrl: target.media_url,
            mediaType: target.media_type,
        })

        const middleIndex = Math.floor((media?.data?.length || 0) / 2)
        if (index > middleIndex && page < (media?.meta?.pagination.total_pages || 0)) {
            setPage(page + 1)
        }

        const targetMedia = mediaRef.current[index]
        if (targetMedia) {
            targetMedia.scrollIntoView({ behavior: 'smooth', inline: 'center' })
        }

        setSelectedMediaIndex(index)
    }

    const handlePreviousImage = useCallback(() => {
        if (selectedMediaIndex === null || selectedMediaIndex === 0) return

        const target = media?.data?.[selectedMediaIndex - 1]
        if (!target) return

        setCurrentMedia({
            mediaUrl: target.media_url,
            mediaType: target.media_type,
        })

        const targetMedia = mediaRef.current[selectedMediaIndex - 1]
        if (targetMedia) {
            targetMedia.scrollIntoView({ behavior: 'smooth', inline: 'center' })
        }

        setSelectedMediaIndex(selectedMediaIndex - 1)
    }, [media?.data, selectedMediaIndex])

    const handleNextImage = useCallback(() => {
        if (selectedMediaIndex === null || selectedMediaIndex === (media?.data?.length || 0) - 1) return

        const target = media?.data?.[selectedMediaIndex + 1]
        if (!target) return

        setCurrentMedia({
            mediaUrl: target.media_url,
            mediaType: target.media_type,
        })

        const targetMedia = mediaRef.current[selectedMediaIndex + 1]
        if (targetMedia) {
            targetMedia.scrollIntoView({ behavior: 'smooth', inline: 'center' })
        }

        setSelectedMediaIndex(selectedMediaIndex + 1)
    }, [media?.data, selectedMediaIndex])

    useEffect(() => {
        if (mediaRef.current.length === 0) return

        const currentImageIndex = media?.data?.findIndex((m) => m.media_url === currentMedia.mediaUrl)
        if (currentImageIndex === -1 || currentImageIndex === undefined) return

        const targetMedia = mediaRef.current[currentImageIndex]
        if (targetMedia) {
            targetMedia.scrollIntoView({ behavior: 'smooth', inline: 'center' })
        }
    }, [currentMedia, media?.data])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowLeft':
                    handlePreviousImage()
                    break
                case 'ArrowRight':
                    handleNextImage()
                    break
                default:
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleNextImage, handlePreviousImage, onClose])

    const getCloudinaryVideoThumbnail = (videoUrl: string) =>
        videoUrl.replace('/video/upload/', '/video/upload/so_auto/').replace(/\.(mp4|mov|avi|webm)$/, '.jpg')

    return (
        <div className="fixed top-0 right-0 bottom-0 left-0 bg-black">
            {currentMedia && (
                <Image
                    src={getCloudinaryVideoThumbnail(currentMedia.mediaUrl)}
                    alt="image"
                    fill
                    className="z-0 object-cover opacity-60 blur-lg select-none"
                    priority
                />
            )}
            <div className="fixed top-0 right-0 bottom-0 left-0 z-10 flex max-h-dvh flex-col">
                <header className="flex items-center justify-end px-4 py-2">
                    <div className="mt-2 flex items-center gap-3 sm:mr-3">
                        {buttons.map((btn, index) =>
                            btn.label ? (
                                <Tippy key={index} content={btn.label}>
                                    <button
                                        onClick={btn.onclick}
                                        className="flex-center bg-opacity-70 h-9 w-9 cursor-pointer rounded-full bg-[#2b2c2e] hover:bg-[#2d2e2e]"
                                    >
                                        {btn.icon}
                                    </button>
                                </Tippy>
                            ) : (
                                <button
                                    key={index}
                                    onClick={btn.onclick}
                                    className="flex-center bg-opacity-70 h-9 w-9 cursor-pointer rounded-full bg-[#2b2c2e] hover:bg-[#2d2e2e]"
                                >
                                    {btn.icon}
                                </button>
                            ),
                        )}
                    </div>
                </header>
                <main className="flex w-full flex-1 items-center justify-between overflow-hidden">
                    <div
                        className="flex-center group bg-opacity-10 h-full cursor-pointer bg-[rgba(0,0,0,0.15)] p-4 transition-all duration-200 hover:-translate-x-1"
                        onClick={handlePreviousImage}
                    >
                        <button className="flex-center bg-opacity-70 h-10 w-10 rounded-full bg-[#40403f] transition-all duration-200 group-hover:bg-[#595b5b]">
                            <FontAwesomeIcon
                                icon={faChevronLeft}
                                className="text-lg text-zinc-300 group-hover:text-white"
                            />
                        </button>
                    </div>

                    {currentMedia &&
                        (() => {
                            switch (currentMedia.mediaType) {
                                case 'image':
                                    return (
                                        <Image
                                            src={currentMedia.mediaUrl}
                                            alt="image"
                                            width={5000}
                                            height={5000}
                                            quality={100}
                                            className="h-auto max-h-full w-auto max-w-[55%] select-none"
                                        />
                                    )
                                case 'video':
                                    return (
                                        <video
                                            src={currentMedia.mediaUrl}
                                            controls
                                            className="h-auto max-h-full w-auto max-w-[55%] select-none"
                                        />
                                    )
                                default:
                                    return null
                            }
                        })()}

                    <div
                        className="flex-center group bg-opacity-10 h-full cursor-pointer bg-[rgba(0,0,0,0.15)] p-4 transition-all duration-200 hover:translate-x-1"
                        onClick={handleNextImage}
                    >
                        <button className="flex-center bg-opacity-70 h-10 w-10 rounded-full bg-[#40403f] transition-all duration-200 group-hover:bg-[#595b5b]">
                            <FontAwesomeIcon
                                icon={faChevronRight}
                                className="text-lg text-zinc-300 group-hover:text-white"
                            />
                        </button>
                    </div>
                </main>

                <footer id="message-images-scrollable" className="flex-center h-16 px-4">
                    <div
                        ref={scrollableRef}
                        className="flex items-center gap-3 [overflow-x:overlay]"
                        onScroll={handleScroll}
                    >
                        {media?.data?.map((m, index) => {
                            switch (m.media_type) {
                                case 'image':
                                    return (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={m.media_url}
                                            alt="image"
                                            width={100}
                                            height={100}
                                            key={index}
                                            className={`mb-1 h-10! w-10! shrink-0! cursor-pointer rounded-md object-cover select-none ${
                                                selectedMediaIndex === index
                                                    ? 'opacity-100 brightness-100'
                                                    : 'opacity-80 brightness-50'
                                            }`}
                                            ref={(el) => {
                                                mediaRef.current[index] = el
                                            }}
                                            onClick={() => handleChooseImage(m.media_url, index)}
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none'
                                            }}
                                            loading="lazy"
                                        />
                                    )
                                case 'video':
                                    return (
                                        <div key={index} className="relative">
                                            <div className="flex-center pointer-events-none absolute top-1/2 left-1/2 z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full select-none">
                                                <FontAwesomeIcon icon={faPlay} />
                                            </div>
                                            <video
                                                autoPlay
                                                preload="metadata"
                                                poster={getCloudinaryVideoThumbnail(m.media_url)}
                                                className={`mb-1 h-10! w-10! shrink-0! cursor-pointer rounded-md object-cover select-none ${
                                                    selectedMediaIndex === index
                                                        ? 'opacity-100 brightness-100'
                                                        : 'opacity-80 brightness-50'
                                                }`}
                                                ref={(el) => {
                                                    mediaRef.current[index] = el
                                                }}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none'
                                                }}
                                                onClick={() => handleChooseImage(m.media_url, index)}
                                            />
                                        </div>
                                    )
                                default:
                                    return null
                            }
                        })}
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default memo(MessageImagesModel)
