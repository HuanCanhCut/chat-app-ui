'use client'

import React from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useSelector } from 'react-redux'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import useSWR from 'swr'

import StoryItem from './StoryItem'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SWRKey from '~/enum/SWRKey'
import { selectCurrentUser } from '~/redux/selector'
import * as storyServices from '~/services/storyService'

const PER_PAGE = 10

const StoryList = () => {
    const currentUser = useSelector(selectCurrentUser)

    const { data: stories } = useSWR([SWRKey.GET_STORY], async () => {
        return await storyServices.getStories({ page: 1, per_page: PER_PAGE })
    })

    return (
        <div className="scroll-bar-hide flex items-center gap-2 overflow-y-auto select-none" id="stories-scrollable">
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

                    <div className="bg-dark-gray relative flex h-12 flex-col items-center justify-end pb-1.5">
                        <p className="text-sm font-medium">Tạo tin</p>

                        <div className="bg-primary flex-center border-dark-gray absolute top-0 right-1/2 size-10 translate-x-1/2 -translate-y-1/2 rounded-full border-4">
                            <Plus />
                        </div>
                    </div>
                </div>
            )}

            {stories?.data && (
                <div className="flex items-center gap-2">
                    <InfiniteScroll
                        dataLength={stories.data.length}
                        next={() => {
                            //
                        }}
                        className="flex gap-2 overflow-hidden!"
                        hasMore={true}
                        scrollThreshold={0.8}
                        loader={
                            <div className="flex justify-center">
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            </div>
                        }
                        scrollableTarget="stories-scrollable"
                    >
                        {stories.data.map((story) => {
                            return <StoryItem key={story.id} story={story} />
                        })}
                    </InfiniteScroll>
                </div>
            )}
        </div>
    )
}

export default StoryList
