'use client'

import { memo, useState } from 'react'
import Image from 'next/image'

interface Props {
    src?: string
    alt?: string
    size?: number
    className?: string
    style?: React.CSSProperties
    onClick?: () => void
    isOnline?: boolean
    onlineClassName?: string
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
}: Props) => {
    const [fallback, setFallback] = useState<string>()

    const handleError = () => {
        setFallback(defaultAvatar)
    }

    if (!src) {
        src = defaultAvatar
    }

    return (
        <div className="relative">
            <Image
                src={fallback || src}
                onError={handleError}
                onClick={onClick}
                alt={alt}
                width={size}
                height={size}
                className={`aspect-square flex-shrink-0 cursor-pointer rounded-full object-cover ${className}`}
                priority
                quality={100}
                style={style}
            />
            {isOnline && (
                <div
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-dark ${onlineClassName}`}
                ></div>
            )}
        </div>
    )
}

export default memo(UserAvatar)
