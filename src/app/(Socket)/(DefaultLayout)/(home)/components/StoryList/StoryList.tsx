'use client'

import React, { useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useSelector } from 'react-redux'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { toast } from 'sonner'
import useSWR from 'swr'

import StoryItem from './StoryItem'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '~/components/ui/button'
import SWRKey from '~/enum/SWRKey'
import { selectCurrentUser } from '~/redux/selector'
import * as storyServices from '~/services/storyService'

const PER_PAGE = 10

const StoryList = () => {
    const currentUser = useSelector(selectCurrentUser)

    const { data: stories, mutate } = useSWR([SWRKey.GET_STORIES], async () => {
        return await storyServices.getStories({ page: 1, per_page: PER_PAGE })
    })

    const [showLeftScrollButton, setShowLeftScrollButton] = useState(false)
    const [showRightScrollButton, setShowRightScrollButton] = useState(true)

    const storyContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (storyContainerRef.current) {
            const isScrollable = storyContainerRef.current.scrollWidth > storyContainerRef.current.clientWidth

            setShowRightScrollButton(isScrollable)
        }
    }, [stories])

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget

        setShowLeftScrollButton(scrollLeft > 0)
        setShowRightScrollButton(scrollLeft + clientWidth < scrollWidth)
    }

    const handleScrollRight = () => {
        if (storyContainerRef.current) {
            storyContainerRef.current.scrollBy({
                left: storyContainerRef.current.clientWidth,
                behavior: 'smooth',
            })
        }
    }

    const handleScrollLeft = () => {
        if (storyContainerRef.current) {
            storyContainerRef.current.scrollBy({
                left: -storyContainerRef.current.clientWidth,
                behavior: 'smooth',
            })
        }
    }

    return (
        <div className="relative">
            {showLeftScrollButton && (stories?.data.length || 0) > 0 && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="bg-light-gray dark:bg-dark-gray absolute top-1/2 left-2 z-10 size-12 -translate-y-1/2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700"
                    onClick={handleScrollLeft}
                >
                    <ChevronLeft className="size-7" />
                </Button>
            )}

            <div
                className="scroll-bar-hide relative flex items-center gap-2 overflow-x-auto select-none"
                ref={storyContainerRef}
                id="stories-scrollable"
                onScroll={handleScroll}
            >
                {currentUser?.data && (
                    <div className="flex aspect-10/16 h-50 shrink-0 cursor-pointer flex-col overflow-hidden rounded-md [&_img]:hover:scale-102 [&_img]:hover:brightness-90">
                        <Image
                            src={currentUser?.data.avatar || '/static/media/default-avatar.jpg'}
                            alt="Story"
                            width={100000}
                            height={100000}
                            quality={100}
                            className="w-full flex-1 object-cover transition duration-100"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                e.currentTarget.src = '/static/media/default-avatar.jpg'
                            }}
                            priority
                        />

                        <div className="dark:bg-dark-gray bg-light-gray relative flex h-12 flex-col items-center justify-end pb-1.5">
                            <p className="text-sm font-medium">Tạo tin</p>

                            <div className="bg-primary flex-center dark:border-dark-gray border-light-gray absolute top-0 right-1/2 size-10 translate-x-1/2 -translate-y-1/2 rounded-full border-4">
                                <Plus className="text-white" />
                            </div>
                        </div>
                    </div>
                )}

                {stories?.data && (
                    <div className="flex items-center gap-2">
                        <InfiniteScroll
                            dataLength={stories.data.length}
                            next={async () => {
                                try {
                                    const response = await storyServices.getStories({
                                        page: stories.meta.pagination.current_page + 1,
                                        per_page: PER_PAGE,
                                    })

                                    const newData = {
                                        ...stories,
                                        data: [...stories.data, ...response.data],
                                        meta: {
                                            ...stories.meta,
                                            pagination: {
                                                ...response.meta.pagination,
                                            },
                                        },
                                    }

                                    mutate(newData, false)
                                } catch (error) {
                                    toast.error('Lỗi khi tải thêm tin')
                                }
                            }}
                            className="flex gap-2 overflow-hidden!"
                            hasMore={
                                stories
                                    ? stories?.meta.pagination.current_page < stories?.meta.pagination.total_pages
                                    : false
                            }
                            scrollThreshold={0.8}
                            loader={
                                <div className="flex justify-center">
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                </div>
                            }
                            scrollableTarget="stories-scrollable"
                        >
                            {stories.data.map((story) => {
                                return (
                                    <React.Fragment key={story.uuid}>
                                        <StoryItem story={story} />
                                    </React.Fragment>
                                )
                            })}
                        </InfiniteScroll>
                    </div>
                )}
            </div>

            {showRightScrollButton && (stories?.data.length || 0) > 0 && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="bg-light-gray dark:bg-dark-gray absolute top-1/2 right-2 z-10 size-12 -translate-y-1/2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700"
                    onClick={handleScrollRight}
                >
                    <ChevronRight className="size-7" />
                </Button>
            )}
        </div>
    )
}

export default StoryList
