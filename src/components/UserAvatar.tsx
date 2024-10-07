'use client'

import Image from 'next/image'
import { memo, useState } from 'react'

interface Props {
    src?: string
    alt?: string
    size?: number
    className?: string
    style?: React.CSSProperties
}

const defaultAvatar = '/static/media/default-avatar.jpg'

export default memo(function UserAvatar({ src = defaultAvatar, size = 36, alt = 'avatar', className, style }: Props) {
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
            alt={alt}
            width={size}
            height={size}
            className={`${className} z cursor-pointer rounded-full object-cover`}
            priority
            style={style}
        />
    )
})
