'use client'

import InfiniteScroll from 'react-infinite-scroll-component'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Tippy from 'huanpenguin-tippy-react'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import useSWR from 'swr'

import SidebarStoryItem from './SidebarStoryItem'
import Logo from '~/components/Logo'
import { Button } from '~/components/ui/button'
import { Spinner } from '~/components/ui/spinner'
import config from '~/config'
import SWRKey from '~/enum/SWRKey'
import { sendEvent } from '~/helpers/events'
import { selectCurrentUser } from '~/redux/selector'
import { useAppSelector } from '~/redux/types'
import * as storyServices from '~/services/storyService'
import { StoryModel } from '~/type/story.type'

const PER_PAGE = 12

interface SidebarStoryProps {
    isModal?: boolean
}

const SidebarStory: React.FC<SidebarStoryProps> = ({ isModal = false }) => {
    const router = useRouter()

    const currentUser = useAppSelector(selectCurrentUser)

    const { data: stories, mutate } = useSWR(SWRKey.GET_STORIES, () => {
        return storyServices.getStories({ page: 1, per_page: PER_PAGE })
    })

    const myStory = stories?.data?.find((story) => story.user.id === currentUser?.data?.id)

    const handleBack = () => {
        if (isModal) {
            sendEvent('STORIES:CLOSE-MODAL', null)
            window.history.replaceState({}, '', config.routes.home)
        } else {
            router.push(config.routes.home)
        }
    }

    return (
        <div className="dark:bg-dark hidden h-dvh max-h-dvh w-[360px] flex-col overflow-hidden bg-white lg:flex">
            <div className="border-border flex items-center gap-2 border-b px-2 py-1">
                <Tippy content="Đóng">
                    <Button className="size-10 rounded-full" variant={'ghost'} size={'icon-lg'} onClick={handleBack}>
                        <X className="size-6" />
                    </Button>
                </Tippy>

                <Logo />
            </div>

            <div className="overflow-y-auto px-3" id="stories-scrollable">
                <h2 className="mt-2 text-2xl font-bold">Tin</h2>

                <div>
                    <p className="mt-2 font-medium">Tin của bạn</p>

                    <div>{myStory && <SidebarStoryItem story={myStory} className="mt-2" />}</div>
                </div>

                <Link href={config.routes.create_story} className="flex h-[70px] items-center gap-2 rounded-lg p-2">
                    <div className="bg-light-gray dark:bg-dark-gray flex size-14 items-center justify-center rounded-full">
                        <Plus className="size-6" />
                    </div>
                    <div>
                        <p>Tạo tin</p>
                        <p className="text-muted-foreground text-sm">Bạn có thể chia sẻ ảnh hoặc viết gì đó.</p>
                    </div>
                </Link>

                <p className="mt-2 font-medium">Tất cả tin</p>

                <InfiniteScroll
                    dataLength={stories?.data.length || 0} //This is important field to render the next data
                    next={async () => {
                        try {
                            if (!stories?.meta) {
                                return
                            }

                            const response = await storyServices.getStories({
                                page: stories?.meta.pagination.current_page + 1,
                                per_page: PER_PAGE,
                            })

                            mutate(
                                (prev) => {
                                    if (!prev) {
                                        return prev
                                    }

                                    return {
                                        ...prev,
                                        data: [...prev.data, ...response.data],
                                        meta: response.meta,
                                    }
                                },
                                {
                                    revalidate: false,
                                },
                            )
                        } catch (error) {
                            toast.error('Lỗi khi tải thêm tin')
                        }
                    }}
                    className="overflow-hidden!"
                    hasMore={
                        stories ? stories?.meta.pagination.current_page < stories?.meta.pagination.total_pages : false
                    }
                    scrollThreshold={0.8}
                    loader={<Spinner className="mx-auto" />}
                    scrollableTarget="stories-scrollable"
                >
                    {stories?.data
                        .filter((story) => {
                            return story.user_id !== currentUser?.data.id
                        })
                        .map((story: StoryModel) => {
                            return <SidebarStoryItem key={story.id} story={story} />
                        })}
                </InfiniteScroll>
            </div>
        </div>
    )
}

export default SidebarStory
