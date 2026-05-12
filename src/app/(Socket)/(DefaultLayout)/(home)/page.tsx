'use client'

import useSWR from 'swr'

import Conversation from './components/Conversation'
import LeftSidebar from './components/LeftSidebar'
import PostList from './components/PostList'
import StoryList from './components/StoryList'
import UploadPost from './components/UploadPost'
import SWRKey from '~/enum/SWRKey'
import * as postService from '~/services/postService'

const LIMIT = 10

export default function Home() {
    const { data: posts, mutate } = useSWR(SWRKey.GET_POSTS, () => {
        return postService.getPosts({ limit: LIMIT })
    })

    return (
        <div className="bg-light-gray dark:bg-dark flex min-h-[calc(100dvh-var(--header-height-mobile))] gap-4 px-2 md:min-h-[calc(100dvh-var(--header-height))]">
            {/* Left sidebar */}
            <div className="sticky top-(--header-height) hidden h-[calc(100dvh-var(--header-height))] shrink-0 xl:block xl:w-90">
                <LeftSidebar />
            </div>

            {/* Main content */}
            <div className="min-w-0 flex-1 pt-4">
                <div className="mx-auto flex max-w-175 flex-col gap-3">
                    <UploadPost />
                    <StoryList />
                    {posts && <PostList posts={posts} mutatePost={mutate} />}
                </div>
            </div>

            <div className="hidden shrink-0 lg:block lg:w-70 xl:w-90">
                <div className="sticky top-(--header-height) h-[calc(100dvh-var(--header-height))] overflow-y-auto pt-4">
                    <Conversation />
                </div>
            </div>
        </div>
    )
}
