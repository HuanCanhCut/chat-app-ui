'use client'

import { memo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'

interface Props {
    src?: string
    alt?: string
    size?: number
    className?: string
    style?: React.CSSProperties
    onClick?: () => void
    isOnline?: boolean
    onlineClassName?: string
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
    href,
}: Props) => {
    const router = useRouter()
    const [fallback, setFallback] = useState<string>()

    const currentUser = useAppSelector(getCurrentUser)

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
                className={`aspect-square shrink-0 cursor-pointer rounded-full object-cover ${className}`}
                priority
                quality={100}
                style={style}
            />
            {isOnline && currentUser?.data?.active_status && (
                <div
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-dark ${onlineClassName}`}
                ></div>
            )}
        </div>
    )
}

export default memo(UserAvatar)
