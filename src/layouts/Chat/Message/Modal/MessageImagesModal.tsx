import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

import { faChevronLeft, faChevronRight, faDownload, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@vendor/tippy'
import SWRKey from '~/enum/SWRKey'
import * as messageServices from '~/services/messageService'
import { MessageModel, MetaPagination } from '~/type/type'

interface MessageImagesModelProps {
    onClose: () => void
    imageUrl: string
}

interface MessageImagesModelData {
    data: string[] | undefined
    meta: MetaPagination['meta'] | undefined
}

const PER_PAGE = 30

const MessageImagesModel = ({ onClose, imageUrl }: MessageImagesModelProps) => {
    const { uuid } = useParams()
    const scrollableRef = useRef<HTMLDivElement>(null)
    const imageRefs = useRef<(HTMLImageElement | null)[]>([])

    const [currentUrl, setCurrentUrl] = useState(imageUrl)
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

    const [page, setPage] = useState(1)

    const formatImagesResponse = (images: MessageModel[]) => {
        return images.reduce<string[]>((acc, image) => {
            return acc.concat(JSON.parse(image.content as string))
        }, [])
    }

    const { data: images, mutate: mutateImages } = useSWR<MessageImagesModelData>(
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
        if (images?.data) {
            setSelectedImageIndex(images?.data.findIndex((image) => image === imageUrl))
        }
    }, [images, imageUrl])

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
                    data: [...(images?.data || []), ...newImages],
                    meta: response?.meta,
                },
                {
                    revalidate: false,
                },
            )
        }

        getMoreImages()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, uuid])

    const handleDownload = async () => {
        const fileName = currentUrl.substring(currentUrl.lastIndexOf('/') + 1).split('?')[0]

        const response = await fetch(currentUrl)
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
            onclick: () => {
                handleDownload()
            },
        },
        {
            icon: <FontAwesomeIcon icon={faXmark} className="text-lg text-white" />,
            onclick: () => {
                onClose()
            },
        },
    ]

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement

        const scrollLeft = target.scrollLeft

        if (!scrollableRef.current) return

        // 40 is the padding of the scrollable container
        if (scrollLeft + scrollableRef.current.offsetWidth >= scrollableRef.current.scrollWidth) {
            if (page >= (images?.meta?.pagination.total_pages || 0)) return

            setPage(page + 1)
        }
    }

    const handleChooseImage = (url: string, index: number) => {
        setCurrentUrl(url)

        const middleIndex = Math.floor((images?.data?.length || 0) / 2)

        if (index > middleIndex && page < (images?.meta?.pagination.total_pages || 0)) {
            setPage(page + 1)
        }

        // scroll to the target image
        const targetImage = imageRefs.current[index]

        if (targetImage) {
            targetImage.scrollIntoView({ behavior: 'smooth', inline: 'center' })
        }

        setSelectedImageIndex(index)
    }

    const handlePreviousImage = useCallback(() => {
        if (selectedImageIndex === null) return

        if (selectedImageIndex === 0) return

        const targetImage = imageRefs.current[selectedImageIndex - 1]

        if (targetImage) {
            targetImage.scrollIntoView({ behavior: 'smooth', inline: 'center' })
        }

        setCurrentUrl(images?.data?.[selectedImageIndex - 1] || '')
        setSelectedImageIndex(selectedImageIndex - 1)
    }, [images?.data, selectedImageIndex])

    const handleNextImage = useCallback(() => {
        if (selectedImageIndex === null) return

        if (selectedImageIndex === (images?.data?.length || 0) - 1) return

        const targetImage = imageRefs.current[selectedImageIndex + 1]

        if (targetImage) {
            targetImage.scrollIntoView({ behavior: 'smooth', inline: 'center' })
        }

        setCurrentUrl(images?.data?.[selectedImageIndex + 1] || '')
        setSelectedImageIndex(selectedImageIndex + 1)
    }, [images?.data, selectedImageIndex])

    useEffect(() => {
        if (imageRefs.current.length === 0) return

        const currentImageIndex = images?.data?.findIndex((image) => image === currentUrl)

        if (currentImageIndex === -1 || currentImageIndex === undefined) return

        const targetImage = imageRefs.current[currentImageIndex]

        if (targetImage) {
            targetImage.scrollIntoView({ behavior: 'smooth', inline: 'center' })
        }
    }, [currentUrl, images?.data])

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

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [handleNextImage, handlePreviousImage, onClose])

    return (
        <div className="fixed top-0 right-0 bottom-0 left-0 bg-black">
            {/* Background overlay */}
            {currentUrl && (
                <Image
                    src={currentUrl}
                    alt="image"
                    fill
                    className="z-0 object-cover opacity-60 blur-lg select-none"
                    priority
                />
            )}
            <div className="fixed top-0 right-0 bottom-0 left-0 z-10 flex max-h-dvh flex-col">
                <header className="flex items-center justify-end px-4 py-2">
                    <div className="mt-2 flex items-center gap-3 sm:mr-3">
                        {buttons.map((btn, index) => {
                            return btn.label ? (
                                <Tippy key={index} content={btn?.label}>
                                    <button
                                        onClick={btn.onclick}
                                        className="flex-center bg-opacity-70 h-9 w-9 rounded-full bg-[#2b2c2e] hover:bg-[#2d2e2e]"
                                    >
                                        {btn.icon}
                                    </button>
                                </Tippy>
                            ) : (
                                <button
                                    key={index}
                                    onClick={btn.onclick}
                                    className="flex-center bg-opacity-70 h-9 w-9 rounded-full bg-[#2b2c2e] hover:bg-[#2d2e2e]"
                                >
                                    {btn.icon}
                                </button>
                            )
                        })}
                    </div>
                </header>
                <main className="flex w-full flex-1 items-center justify-between overflow-hidden">
                    <div
                        className="flex-center group bg-opacity-10 h-full cursor-pointer bg-[rgb(0,0,0)] p-4 transition-all duration-200 hover:-translate-x-1"
                        onClick={handlePreviousImage}
                    >
                        <button className="flex-center bg-opacity-70 h-10 w-10 rounded-full bg-[#40403f] transition-all duration-200 group-hover:bg-[#595b5b]">
                            <FontAwesomeIcon
                                icon={faChevronLeft}
                                className="text-lg text-zinc-300 group-hover:text-white"
                            />
                        </button>
                    </div>
                    {currentUrl && (
                        <Image
                            src={currentUrl}
                            alt="image"
                            width={5000}
                            height={5000}
                            quality={100}
                            className="h-auto max-h-full w-auto max-w-[55%] select-none"
                        />
                    )}
                    <div
                        className="flex-center group bg-opacity-10 h-full cursor-pointer bg-[rgb(0,0,0)] p-4 transition-all duration-200 hover:translate-x-1"
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
                        {images?.data?.map((image, index) => {
                            return (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={image}
                                    alt="image"
                                    width={100}
                                    height={100}
                                    key={index}
                                    className={`mb-1 h-10! w-10! shrink-0! cursor-pointer rounded-md object-cover select-none ${
                                        selectedImageIndex === index
                                            ? 'opacity-100 brightness-100'
                                            : 'opacity-80 brightness-50'
                                    }`}
                                    ref={(el) => {
                                        imageRefs.current[index] = el
                                    }}
                                    onClick={() => handleChooseImage(image, index)}
                                    onError={(e) => {
                                        console.error('Image load error:', image)
                                        e.currentTarget.style.display = 'none'
                                    }}
                                    loading="lazy"
                                />
                            )
                        })}
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default memo(MessageImagesModel)
