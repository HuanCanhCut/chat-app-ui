import Image from 'next/image'
import { memo, useState } from 'react'

interface Props {
    src?: string
    fallback?: string
    alt?: string
    width?: number
    height?: number
    className?: string
    style?: React.CSSProperties
}

const defaultAvatar = '/static/media/default-avatar.jpg'

const CustomImage = ({
    src,
    fallback: customFallback = defaultAvatar,
    width = 1000,
    height = 1000,
    alt = 'avatar',
    className,
    style,
}: Props) => {
    const [fallback, setFallback] = useState<string>()

    const handleError = () => {
        setFallback(defaultAvatar)
    }

    if (!src) {
        src = customFallback
    }
    return (
        <Image
            src={fallback || src}
            onError={handleError}
            alt={alt}
            width={width}
            height={height}
            className={`cursor-pointer overflow-hidden object-cover ${className}`}
            priority
            style={style}
            quality={100}
        />
    )
}

export default memo(CustomImage)
