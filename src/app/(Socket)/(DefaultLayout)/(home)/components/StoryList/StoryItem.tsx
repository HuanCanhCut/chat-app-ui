import Image from 'next/image'

import UserAvatar from '~/components/UserAvatar'
import { cn } from '~/lib/utils'
import { StoryModel } from '~/type/story.type'

interface StoryItemProps {
    story: StoryModel
}

const StoryItem: React.FC<StoryItemProps> = ({ story }) => {
    return (
        <div
            key={story.id}
            className="relative flex aspect-10/16 h-50 cursor-pointer flex-col overflow-hidden rounded-md [&_img]:hover:scale-101 [&_img]:hover:brightness-90"
        >
            {(() => {
                switch (story.type) {
                    case 'video':
                    case 'image':
                        return (
                            <Image
                                src={story.url.replace(/\.[^.]+$/, '.jpg')}
                                alt="Story"
                                width={100000}
                                height={100000}
                                quality={100}
                                className="h-full w-full object-cover transition duration-100"
                                priority
                            />
                        )
                    case 'text':
                        return <h1>text</h1>
                }
            })()}

            <div className="absolute top-1 left-1 z-10">
                <UserAvatar
                    alt=""
                    src={story.user.avatar}
                    className={cn('size-10', {
                        'border-primary border-4': !story.is_viewed,
                    })}
                />
            </div>

            <p className="absolute bottom-2 line-clamp-2 max-w-full truncate text-sm font-medium [word-break:break-word]">
                {story.user.full_name}
            </p>
        </div>
    )
}

export default StoryItem
