import { X } from 'lucide-react'

import CustomImage from '../Image'
import { Button } from '../ui/button'
import { cn } from '~/lib/utils'

const MAX_DISPLAY_COUNT = 5

interface MediaGridProps {
    media: Record<'url' | 'type', string>[]
    isShowRemoveButton?: boolean
    handleRemoveFile?: (index: number) => void
    className?: string
}

const MediaGrid: React.FC<MediaGridProps> = ({
    media,
    isShowRemoveButton = true,
    handleRemoveFile = () => {},
    className,
}) => {
    const displayFiles = media.slice(0, MAX_DISPLAY_COUNT)
    const count = displayFiles.length

    const gridClass =
        {
            1: 'grid-cols-1',
            2: 'grid-cols-2',
            3: 'grid-cols-2',
            4: 'grid-cols-2',
            5: 'grid-cols-6',
        }[count] ?? 'grid-cols-3'

    return (
        <div className={cn('border-border mt-4 grid gap-0.5 rounded-md border', gridClass, className)}>
            {displayFiles.map((md, index) => {
                const spanClass =
                    count === 5
                        ? index < 2
                            ? 'col-span-3'
                            : 'col-span-2'
                        : count === 3 && index === 2
                          ? 'col-span-2'
                          : ''

                return (
                    <div key={index} className={`relative w-full ${spanClass}`}>
                        {index === MAX_DISPLAY_COUNT - 1 && media.length > MAX_DISPLAY_COUNT && (
                            <div className="flex-center absolute top-0 right-0 bottom-0 left-0">
                                <p className="text-4xl font-bold select-none">+{media.length - 5}</p>
                            </div>
                        )}

                        {isShowRemoveButton && (
                            <Button
                                className="absolute top-1 right-1 z-10 cursor-pointer bg-zinc-600! dark:bg-zinc-600!"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    handleRemoveFile(index)
                                }}
                            >
                                <X />
                            </Button>
                        )}

                        {md.type.startsWith('video') ? (
                            <video
                                className={`aspect-square w-full rounded-md object-cover select-none ${spanClass}`}
                                src={md.url}
                                autoPlay
                                loop
                                muted
                                preload="auto"
                                controls
                                controlsList="nofullscreen nodownload noplaybackrate noremoteplayback"
                                disablePictureInPicture
                            />
                        ) : (
                            <CustomImage
                                className={`aspect-square w-full rounded-md object-cover select-none ${spanClass}`}
                                src={md.url}
                                alt={md.url}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default MediaGrid
