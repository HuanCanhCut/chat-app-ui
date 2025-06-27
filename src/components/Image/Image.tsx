import { memo, useState } from 'react'
import Image from 'next/image'

interface Props extends Omit<React.ComponentPropsWithoutRef<typeof Image>, 'src' | 'alt'> {
    src?: string
    alt?: string
    fallback?: string
}

const defaultAvatar = '/static/media/fallback_img.jpg'

export default memo(function CustomImage({
    src,
    fallback: customFallback = defaultAvatar,
    width = 1000,
    height = 1000,
    alt = 'avatar',
    className,
    style,
    ...props
}: Props) {
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
            {...props}
        />
    )
})
