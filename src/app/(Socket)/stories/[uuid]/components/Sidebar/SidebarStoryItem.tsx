import Link from 'next/link'

import UserAvatar from '~/components/UserAvatar'
import config from '~/config'
import { cn } from '~/lib/utils'
import { StoryModel } from '~/type/story.type'
import { momentTimezone } from '~/utils/moment'

interface SidebarStoryItemProps {
    story: StoryModel
    className?: string
}

const SidebarStoryItem: React.FC<SidebarStoryItemProps> = ({ story, className = '' }) => {
    return (
        <Link
            className={cn(
                'hover:bg-muted-foreground/10 flex cursor-pointer items-center gap-2 rounded-lg p-2 select-none',
                className,
            )}
            href={`${config.routes.stories}/${story.user.uuid}`}
        >
            <UserAvatar story={story} src={story.user.avatar} className="size-14" size={200} />

            <div>
                <p className="font-medium">{story.user.full_name}</p>
                <p className="text-muted-foreground">
                    {story.unviewed_count > 0 && <span className="text-blue-link">{story.unviewed_count} thẻ mới</span>}
                    {story.unviewed_count > 0 && ' · '}
                    <span className="text-sm">{momentTimezone(story.created_at)}</span>
                </p>
            </div>
        </Link>
    )
}

export default SidebarStoryItem
