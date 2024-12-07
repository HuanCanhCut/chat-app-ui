'use client'

import Image from 'next/image'
import { memo, useState } from 'react'

interface Props {
    src?: string
    alt?: string
    size?: number
    className?: string
    style?: React.CSSProperties
    onClick?: () => void
}

const defaultAvatar = '/static/media/default-avatar.jpg'

const UserAvatar = ({
    src = defaultAvatar,
    size = 36,
    alt = 'avatar',
    className,
    style,
    onClick = () => {},
}: Props) => {
    const [fallback, setFallback] = useState<string>()

    const handleError = () => {
        setFallback(defaultAvatar)
    }

    if (!src) {
        src = defaultAvatar
    }

    return (
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
    )
}

export default memo(UserAvatar)
