'use client'

import { memo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { cn } from '~/lib/utils'
import { selectCurrentUser } from '~/redux/selector'
import { useAppSelector } from '~/redux/types'
import { StoryModel } from '~/type/story.type'

interface Props {
    src?: string
    alt?: string
    size?: number
    className?: string
    style?: React.CSSProperties
    onClick?: () => void
    isOnline?: boolean
    onlineClassName?: string
    story?: StoryModel
    href?: string
}

const defaultAvatar = '/static/media/default-avatar.jpg'

const UserAvatar = ({
    src = defaultAvatar,
    size = 36,
    alt = 'avatar',
    className,
    style,
    onClick = () => {},
    isOnline = false,
    onlineClassName = '',
    story,
    href,
}: Props) => {
    const router = useRouter()
    const [fallback, setFallback] = useState<string>()

    const currentUser = useAppSelector(selectCurrentUser)

    const handleError = () => {
        setFallback(defaultAvatar)
    }

    if (!src) {
        src = defaultAvatar
    }

    const handleRedirect = (href: string | undefined) => {
        if (href) {
            router.push(href)
        }
    }

    return (
        <div className="relative flex" onClick={() => handleRedirect(href)}>
            <Image
                src={fallback || src}
                onError={handleError}
                onClick={onClick}
                alt={alt}
                width={size}
                height={size}
                className={cn(`aspect-square shrink-0 cursor-pointer rounded-full object-cover`, className, {
                    'border-2 p-0.5': story,
                    'border-primary': story && !story.is_viewed,
                    'border-zinc-300 dark:border-zinc-600': story && story.is_viewed,
                })}
                priority
                quality={100}
                style={style}
            />
            {isOnline && currentUser?.data?.active_status && (
                <div
                    className={`dark:border-dark absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 ${onlineClassName}`}
                ></div>
            )}
        </div>
    )
}

export default memo(UserAvatar)
