import { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import Link from 'next/link'
import { ChevronUp, Eye, X } from 'lucide-react'
import useSWR from 'swr'

import baseReactionIcon from '~/common/baseReactionIcon'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Spinner } from '~/components/ui/spinner'
import UserAvatar from '~/components/UserAvatar'
import config from '~/config'
import SWRKey from '~/enum/SWRKey'
import * as storyServices from '~/services/storyService'
import { BaseReactionUnified, ReactionModel } from '~/type/reaction.type'

const iconMapping = baseReactionIcon(18)

interface UserViewedStoryProps {
    story_uuid: string
}

const PER_PAGE = 10

const UserViewedStory: React.FC<UserViewedStoryProps> = ({ story_uuid }) => {
    const [isOpenDrawer, setIsOpenDrawer] = useState(false)

    const { data: userViewedStories, mutate } = useSWR(
        story_uuid ? [SWRKey.GET_USER_VIEWED_STORIES, story_uuid] : null,
        () => {
            return storyServices.getUserViewedStories({
                story_uuid,
                page: 1,
                per_page: PER_PAGE,
            })
        },
    )

    const totalViews = userViewedStories?.meta.pagination.total || 0

    useEffect(() => {
        setIsOpenDrawer(false)
    }, [story_uuid])

    return (
        <>
            {!isOpenDrawer ? (
                <div
                    className="absolute bottom-2 left-3 flex cursor-pointer flex-col"
                    onClick={() => setIsOpenDrawer(!isOpenDrawer)}
                >
                    <ChevronUp />
                    <p className="text-lg font-medium select-none">{totalViews} người xem</p>
                    {totalViews > 0 && (
                        <UserAvatar src={userViewedStories?.data[0].user.avatar} size={24} className="mt-2" />
                    )}
                </div>
            ) : (
                <div className="dark:bg-dark absolute top-[10%] right-0 bottom-0 left-0 flex flex-col bg-white px-2">
                    <div className="border-border relative flex items-center justify-center border-b py-4">
                        <p className="text-center text-lg font-medium">Chi tiết về tin</p>
                        <Button
                            variant="ghost"
                            size="icon-lg"
                            className="absolute top-1/2 right-0 -translate-y-1/2 rounded-full"
                            onClick={() => setIsOpenDrawer(false)}
                        >
                            <X />
                        </Button>
                    </div>

                    <ScrollArea className="h-0 flex-1 py-2" id="user_viewed_story_scrollable">
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Eye className="size-5" />
                            <span className="text-base font-medium">
                                {userViewedStories?.meta.pagination.total} người xem
                            </span>
                        </p>

                        <InfiniteScroll
                            dataLength={userViewedStories?.data.length || 0} //This is important field to render the next data
                            next={async () => {
                                try {
                                    if (!userViewedStories?.meta.pagination.current_page) {
                                        return
                                    }

                                    const response = await storyServices.getUserViewedStories({
                                        story_uuid,
                                        page: userViewedStories?.meta.pagination.current_page + 1,
                                        per_page: PER_PAGE,
                                    })

                                    mutate(
                                        {
                                            ...userViewedStories,
                                            data: [...userViewedStories?.data, ...response.data],
                                            meta: {
                                                pagination: response.meta.pagination,
                                            },
                                        },
                                        {
                                            revalidate: false,
                                        },
                                    )
                                } catch (_) {}
                            }}
                            className="mt-2 overflow-hidden!"
                            hasMore={
                                userViewedStories
                                    ? userViewedStories?.meta.pagination.current_page <
                                      userViewedStories?.meta.pagination.total_pages
                                    : false
                            }
                            scrollThreshold={0.8}
                            loader={<Spinner className="mx-auto" />}
                            scrollableTarget="user_viewed_story_scrollable"
                        >
                            {userViewedStories?.data.map((story) => {
                                return (
                                    <Link
                                        href={`${config.routes.user}/@${story.user.nickname}`}
                                        key={story.id}
                                        className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-4"
                                    >
                                        <div className="flex flex-1 items-center gap-2">
                                            <UserAvatar src={story.user.avatar} className="size-12" />
                                            <p className="text-sm font-medium">{story.user.full_name}</p>
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                            {story.user.reactions.map((reaction: ReactionModel) => {
                                                const react = reaction.react as BaseReactionUnified

                                                const icon = iconMapping[react]

                                                return <div key={reaction.id}>{icon}</div>
                                            })}
                                        </div>
                                    </Link>
                                )
                            })}
                        </InfiniteScroll>
                    </ScrollArea>
                </div>
            )}
        </>
    )
}

export default UserViewedStory
