'use client'

import Image from 'next/image'
import { memo, useState } from 'react'

interface Props {
    src: string
    alt?: string
    size?: number
}

const defaultAvatar = '/static/media/default-avatar.jpg'

export default memo(function UserAvatar({ src = defaultAvatar, size = 32, alt = 'avatar' }: Props) {
    const [fallback, setFallback] = useState<string>()

    const handleError = () => {
        setFallback(defaultAvatar)
    }

    return (
        <Image
            src={fallback || src}
            onError={handleError}
            alt={alt}
            width={size}
            height={size}
            className="cursor-pointer rounded-full object-cover"
            priority
        />
    )
})
