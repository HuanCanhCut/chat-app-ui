import React, { useEffect, useRef, useState, memo } from 'react'
import Image from 'next/image'
import { faChevronLeft, faChevronRight, faDownload, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@tippyjs/react'
import useSWR from 'swr'

import * as messageServices from '~/services/message'
import SWRKey from '~/enum/SWRKey'
import { useParams } from 'next/navigation'
import { MessageModel, MetaPagination } from '~/type/type'

interface MessageImagesModelProps {
    onClose: () => void
    imageUrl: string
}

interface MessageImagesModelData {
    data: string[] | undefined
    meta: MetaPagination['meta'] | undefined
}

const PER_PAGE = 1

const MessageImagesModel = ({ onClose, imageUrl }: MessageImagesModelProps) => {
    const { uuid } = useParams()
    const scrollableRef = useRef<HTMLDivElement>(null)

    const [currentUrl, setCurrentUrl] = useState(imageUrl)

    const [page, setPage] = useState(1)

    const formatImagesResponse = (images: MessageModel[]) => {
        return images.reduce<string[]>((acc, image) => {
            return acc.concat(JSON.parse(image.content))
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
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 top-0 bg-black">
            {/* Background overlay */}
            {currentUrl && (
                <Image
                    src={currentUrl}
                    alt="image"
                    fill
                    className="z-0 select-none object-cover opacity-60 blur-lg"
                    priority
                />
            )}
            <div className="fixed bottom-0 left-0 right-0 top-0 z-10 flex max-h-lvh flex-col">
                <header className="flex items-center justify-end px-4 py-2">
                    <div className="mt-2 flex items-center gap-3 sm:mr-3">
                        {buttons.map((btn, index) => {
                            return btn.label ? (
                                <Tippy key={index} content={btn?.label}>
                                    <button
                                        onClick={btn.onclick}
                                        className="flex-center h-9 w-9 rounded-full bg-[#2b2c2e] bg-opacity-70 hover:bg-[#2d2e2e]"
                                    >
                                        {btn.icon}
                                    </button>
                                </Tippy>
                            ) : (
                                <button
                                    key={index}
                                    onClick={btn.onclick}
                                    className="flex-center h-9 w-9 rounded-full bg-[#2b2c2e] bg-opacity-70 hover:bg-[#2d2e2e]"
                                >
                                    {btn.icon}
                                </button>
                            )
                        })}
                    </div>
                </header>
                <main className="flex w-full flex-1 items-center justify-between overflow-hidden">
                    <div className="flex-center group h-full cursor-pointer bg-[rgb(0,0,0)] bg-opacity-10 p-4 transition-all duration-200 hover:-translate-x-1">
                        <button className="flex-center h-10 w-10 rounded-full bg-[#40403f] bg-opacity-70 transition-all duration-200 group-hover:bg-[#595b5b]">
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
                            className="h-auto max-h-full w-auto max-w-[55%]"
                        />
                    )}
                    <div className="flex-center group h-full cursor-pointer bg-[rgb(0,0,0)] bg-opacity-10 p-4 transition-all duration-200 hover:translate-x-1">
                        <button className="flex-center h-10 w-10 rounded-full bg-[#40403f] bg-opacity-70 transition-all duration-200 group-hover:bg-[#595b5b]">
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
                                <Image
                                    src={image}
                                    alt="image"
                                    width={100}
                                    height={100}
                                    key={index}
                                    className="mb-1 h-10 w-10 cursor-pointer rounded-md"
                                    priority
                                    quality={100}
                                    onClick={() => handleChooseImage(image, index)}
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
