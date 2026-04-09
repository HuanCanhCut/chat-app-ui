import { SetStateAction, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Tippy from 'huanpenguin-tippy-react'
import { X } from 'lucide-react'

import ConfirmModal from '~/components/ConfirmModal'
import Logo from '~/components/Logo'
import { Button } from '~/components/ui/button'
import UserAvatar from '~/components/UserAvatar'
import { cn } from '~/lib/utils'
import { selectCurrentUser } from '~/redux/selector'
import { useAppSelector } from '~/redux/types'

const textStoryBackgrounds = [
    {
        logo: 'https://res.cloudinary.com/dkmwrkngj/image/upload/v1775721232/58262940_285817512345690_8722691640277336064_n_i4mdet.png',
        background:
            'https://res.cloudinary.com/dkmwrkngj/image/upload/v1775720869/64502458_318989065695201_361648744678031360_n_nnnwx0.jpg',
    },
    {
        logo: 'https://res.cloudinary.com/dkmwrkngj/image/upload/v1775721193/51752084_299352544100598_4339278271729369088_n_gzziyp.png',
        background:
            'https://res.cloudinary.com/dkmwrkngj/image/upload/v1775720998/51635525_299352550767264_3311165149489922048_n_i5whof.jpg',
    },
    {
        logo: 'https://res.cloudinary.com/dkmwrkngj/image/upload/v1775721135/51483155_1187607278075341_6337956575826673664_n_frsrkr.png',
        background:
            'https://res.cloudinary.com/dkmwrkngj/image/upload/v1775720932/51738420_1187607281408674_8427104449004044288_n_upfflc.jpg',
    },
    {
        logo: 'https://res.cloudinary.com/dkmwrkngj/image/upload/v1775721097/40391974_474025459674109_1960411309426081792_n_ne5vq7.png',
        background:
            'https://res.cloudinary.com/dkmwrkngj/image/upload/v1775721030/40399444_474025463007442_2355185586374967296_n_usf8pj.jpg',
    },
]

interface SidebarProps {
    selectedType: 'text' | 'image' | 'video' | null
    setSelectedType: React.Dispatch<SetStateAction<'text' | 'image' | 'video' | null>>
    selectedBackground: string | null
    setSelectedBackground: React.Dispatch<SetStateAction<string | null>>
    caption: string
    onSubmit: () => Promise<void>
}

const Sidebar: React.FC<SidebarProps> = ({
    selectedType,
    setSelectedType,
    selectedBackground,
    setSelectedBackground,
    caption,
    onSubmit,
}) => {
    const currentUser = useAppSelector(selectCurrentUser)

    const router = useRouter()

    const [open, setOpen] = useState(false)

    const handleBack = () => {
        router.back()
    }

    return (
        <>
            <ConfirmModal
                isOpen={open}
                title="Bỏ tin"
                description="Bạn có chắc chắn muốn bỏ tin này không? Hệ thống sẽ không lưu tin của bạn."
                onConfirm={() => {
                    setOpen(false)
                    setSelectedType(null)
                }}
                confirmText="Bỏ"
                closeModal={() => setOpen(false)}
            />
            <div className="dark:bg-dark-gray hidden h-full w-[350px] flex-col bg-white lg:flex">
                <div className="border-border flex items-center gap-2 border-b px-2 py-1">
                    <Tippy content="Đóng" delay={[300, 0]}>
                        <Button
                            className="bg-light-gray size-10 rounded-full dark:bg-zinc-700"
                            variant={'ghost'}
                            size={'icon-lg'}
                            onClick={handleBack}
                        >
                            <X className="size-6" />
                        </Button>
                    </Tippy>

                    <Logo />
                </div>

                <div className="mt-3">
                    <h3 className="px-2 text-2xl font-bold">Tin của bạn</h3>

                    <div className="border-muted flex items-center gap-3 border-b px-2 py-4">
                        <UserAvatar src={currentUser?.data.avatar} className="size-14" />
                        <p className="line-clamp-1 truncate text-lg font-medium [word-break:break-word] whitespace-pre-wrap">
                            {currentUser?.data.full_name}
                        </p>
                    </div>
                </div>

                <div className="w-full flex-1 flex-col p-2">
                    {(() => {
                        switch (selectedType) {
                            case 'text':
                                return (
                                    <div className="border-border gap-2 rounded-md border p-3">
                                        <p className="text-muted-foreground text-base">Phông nền</p>
                                        <p className="text-muted-foreground text-sm">Màu chuyển sắc</p>
                                        <div className="mt-2 flex flex-wrap items-center">
                                            {textStoryBackgrounds.map((item) => (
                                                <div
                                                    key={item.logo}
                                                    className={cn(
                                                        'flex cursor-pointer items-center gap-2 rounded-full border-3 border-transparent p-0.5',
                                                        {
                                                            'border-primary': item.background === selectedBackground,
                                                        },
                                                    )}
                                                    onClick={() => {
                                                        setSelectedBackground(item.background)
                                                    }}
                                                >
                                                    <Image
                                                        src={item.logo}
                                                        alt={item.logo}
                                                        width={24}
                                                        height={24}
                                                        className="rounded-full"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            default:
                                return null
                        }
                    })()}
                </div>

                {selectedType && (
                    <div className="flex items-center gap-2 p-3">
                        <Button className="flex-1 py-4" variant="secondary" onClick={() => setOpen(true)}>
                            Bỏ
                        </Button>
                        <Button
                            className="flex-2 py-4"
                            disabled={selectedType === 'text' && !caption}
                            onClick={async () => {
                                await onSubmit()
                            }}
                        >
                            Chia sẻ lên tin
                        </Button>
                    </div>
                )}
            </div>
        </>
    )
}

export default Sidebar
