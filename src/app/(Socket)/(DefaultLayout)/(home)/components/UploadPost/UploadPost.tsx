'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { EmojiClickData } from 'emoji-picker-react'
import Tippy from 'huanpenguin-tippy-react'
import HeadlessTippy from 'huanpenguin-tippy-react/headless'
import { Earth, ImagesIcon, Smile, X } from 'lucide-react'
import pMap from 'p-map'
import { toast } from 'sonner'

import BackgroundSelector from './BackgroundSelector'
import Emoji from '~/components/Emoji'
import CustomImage from '~/components/Image'
import PopperWrapper from '~/components/PopperWrapper'
import SwitchButton from '~/components/SwitchButton'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { Textarea } from '~/components/ui/textarea'
import UserAvatar from '~/components/UserAvatar'
import handleApiError from '~/helpers/handleApiError'
import uploadToCloudinary from '~/helpers/uploadToCloudinary'
import { cn } from '~/lib/utils'
import { selectCurrentUser } from '~/redux/selector'
import { useAppSelector } from '~/redux/types'
import * as cloudinaryService from '~/services/cloudinaryService'
import * as postService from '~/services/postService'
import { validateMedia } from '~/utils/validateMediaUpload'

interface IFile extends File {
    preview?: string
}

const UploadPost = () => {
    const currentUser = useAppSelector(selectCurrentUser)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const contenteditableRef = useRef<HTMLDivElement | null>(null)
    const submitButtonRef = useRef<HTMLButtonElement | null>(null)

    const [isOpen, setIsOpen] = useState(false)
    const [isPublic, setIsPublic] = useState(true)
    const [caption, setCaption] = useState('')
    const [emojiOpen, setEmojiOpen] = useState(false)
    const [postFiles, setPostFiles] = useState<IFile[]>([])
    const [background, setBackground] = useState<string | null>(null)

    const handleTogglePublic = () => {
        setIsPublic((prev) => !prev)
    }

    const handleToggleEmojiOpen = () => {
        setEmojiOpen((prev) => {
            return !prev
        })
    }

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setCaption((prev) => prev + emojiData.emoji)
    }

    const handleRevokeBlobs = useCallback(() => {
        postFiles.forEach((file: IFile) => {
            if (file.preview) {
                URL.revokeObjectURL(file.preview)
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setEmojiOpen(false)
            setCaption('')

            handleRevokeBlobs()

            setPostFiles([])
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files

        const ACCEPTED_TYPES = ['image/', 'video/']

        if (files?.length) {
            const { validFiles, invalidFiles } = validateMedia(files, ACCEPTED_TYPES)

            if (invalidFiles.length > 0) {
                toast.error('Chỉ chấp nhận tải lên ảnh và video')
            }

            validFiles.forEach((file: IFile) => {
                file.preview = URL.createObjectURL(file)

                setPostFiles((prev) => [...prev, file])
            })
        }

        // allow user to upload multiple images same name
        e.target.value = ''
    }

    useEffect(() => {
        return () => {
            handleRevokeBlobs()
        }
    }, [handleRevokeBlobs])

    useEffect(() => {
        if (contenteditableRef.current && contenteditableRef.current.innerText !== caption) {
            contenteditableRef.current.innerText = caption
        }
    }, [caption])

    const handleChooseBackground = (background: string) => {
        setBackground(background)
    }

    const handleRemoveFile = (index: number) => {
        setPostFiles((prev) => {
            return prev.filter((_, i) => {
                return i !== index
            })
        })
    }

    const handleUploadPost = async () => {
        const toastId = toast.loading('Bài viết của bạn đang được tải lên, vui lòng không đóng ứng dụng...')

        setIsOpen(false)

        try {
            interface PostData {
                caption: string
                is_public: boolean
                media?: Array<{
                    media_url: string
                    media_type: 'image' | 'video'
                }>
            }

            const postData: PostData = {
                caption,
                is_public: isPublic,
            }

            if (postFiles.length > 0) {
                const folder = `chat-app-${process.env.NODE_ENV}/posts`
                const { data: signature } = await cloudinaryService.createCloudinarySignature({
                    folder,
                })

                const postMedia = await pMap(
                    postFiles,
                    async (file) => {
                        return uploadToCloudinary({
                            file,
                            signature,
                        })
                    },
                    { concurrency: 5 },
                )

                const postMediaUrls = postMedia.map((media) => {
                    return {
                        media_url: media.secure_url,
                        media_type: media.resource_type as 'image' | 'video',
                    }
                })

                postData['media'] = postMediaUrls
            }

            await postService.createPost({ postData })

            toast.success('Đăng bài viết thành công!', {
                id: toastId,
            })

            submitButtonRef.current?.setAttribute('disabled', 'true')
        } catch (error) {
            handleApiError(error, undefined, toastId.toString())
        } finally {
            submitButtonRef.current?.removeAttribute('disabled')
        }
    }

    return (
        <PopperWrapper className="flex max-w-none items-center gap-4 rounded-xl border-none p-3 shadow-xs dark:bg-[#27292a]">
            <UserAvatar src={currentUser?.data.avatar} />

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <div className="flex-1">
                    <DialogTrigger asChild>
                        <div className="flex-1 rounded-lg bg-[#f3f2f5] p-2 text-zinc-600 select-none dark:bg-[#333334] dark:text-zinc-400">
                            {currentUser?.data.last_name} ơi, bạn đang nghĩ gì thế?
                        </div>
                    </DialogTrigger>
                    <DialogContent className="dark:bg-dark-gray sm:max-w-lg" aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle>Tạo bài viết</DialogTitle>
                        </DialogHeader>
                        <div>
                            <div className="flex items-center gap-3">
                                <UserAvatar src={currentUser?.data.avatar} />
                                <div>
                                    <p className="font-semibold">{currentUser?.data.full_name}</p>

                                    <div className="mt-1 flex items-center gap-2">
                                        <Tippy content="Công khai">
                                            <Earth className="text-muted-foreground size-4" />
                                        </Tippy>
                                        <SwitchButton isOn={isPublic} onClick={handleTogglePublic} />
                                    </div>
                                </div>
                            </div>

                            {background ? (
                                <div
                                    ref={contenteditableRef}
                                    defaultValue={' '}
                                    aria-valuetext={caption}
                                    contentEditable
                                    suppressContentEditableWarning
                                    data-placeholder={`${currentUser?.data.full_name} ơi, bạn đang nghĩ gì thế?`}
                                    className={cn(
                                        'flex-center mt-4 h-[300px] w-full rounded-md border-none px-4 text-center text-3xl leading-[300px] font-bold [word-break:break-word] outline-none',
                                        {
                                            'leading-normal': caption,
                                        },
                                    )}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const lines = e.currentTarget.innerText.split('\n').length ?? 0
                                            if (lines >= 5) {
                                                e.preventDefault()
                                                setBackground(null)
                                            }
                                        }
                                    }}
                                    onInput={(e: React.FormEvent<HTMLDivElement>) => {
                                        setCaption(e.currentTarget.innerText)
                                    }}
                                    style={{ backgroundColor: background }}
                                ></div>
                            ) : (
                                <Textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    className={cn(
                                        'bg-light-gray mt-4 h-[300px] resize-none ring-0 placeholder:text-xl focus-visible:border-transparent focus-visible:ring-0',
                                        !caption && 'text-xl!',
                                        caption && 'text-base!',
                                        {
                                            'h-12 min-h-12': postFiles.length > 0,
                                        },
                                    )}
                                    placeholder={`${currentUser?.data.full_name} ơi, bạn đang nghĩ gì thế?`}
                                />
                            )}

                            <div className="max-h-105 overflow-y-auto">
                                {postFiles.length > 0 &&
                                    (() => {
                                        const MAX_DISPLAY_COUNT = 5

                                        const displayFiles = postFiles.slice(0, MAX_DISPLAY_COUNT)
                                        const count = displayFiles.length

                                        const gridClass =
                                            {
                                                1: 'grid-cols-1',
                                                2: 'grid-cols-2',
                                                3: 'grid-cols-3',
                                                4: 'grid-cols-2',
                                                5: 'grid-cols-6',
                                            }[count] ?? 'grid-cols-3'

                                        return (
                                            <div
                                                className={`border-border mt-4 grid gap-0.5 rounded-md border ${gridClass}`}
                                            >
                                                {displayFiles.map((file, index) => {
                                                    const spanClass =
                                                        count === 5 ? (index < 2 ? 'col-span-3' : 'col-span-2') : ''

                                                    return (
                                                        <div key={index} className={`relative w-full ${spanClass}`}>
                                                            {index === MAX_DISPLAY_COUNT - 1 &&
                                                                postFiles.length > MAX_DISPLAY_COUNT && (
                                                                    <div className="flex-center absolute top-0 right-0 bottom-0 left-0">
                                                                        <p className="text-4xl font-bold select-none">
                                                                            +{postFiles.length - 5}
                                                                        </p>
                                                                    </div>
                                                                )}

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

                                                            {file.type.startsWith('video') ? (
                                                                <video
                                                                    className={`aspect-square w-full rounded-md object-cover select-none ${spanClass}`}
                                                                    src={file.preview}
                                                                    autoPlay
                                                                    muted
                                                                    loop
                                                                />
                                                            ) : (
                                                                <CustomImage
                                                                    className={`aspect-square w-full rounded-md object-cover select-none ${spanClass}`}
                                                                    src={file.preview}
                                                                    alt={file.name}
                                                                />
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })()}
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                {postFiles.length === 0 && (
                                    <BackgroundSelector onSetBackground={handleChooseBackground} />
                                )}
                                <div className="flex shrink-0">
                                    {!background && (
                                        <Tippy content="Thêm hình ảnh">
                                            <Button
                                                variant={'ghost'}
                                                size={'icon'}
                                                onClick={() => {
                                                    fileInputRef.current?.click()
                                                }}
                                            >
                                                <ImagesIcon className="size-5" />
                                            </Button>
                                        </Tippy>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                    />

                                    <HeadlessTippy
                                        interactive
                                        render={() => {
                                            return <Emoji onEmojiClick={handleEmojiClick} isOpen={emojiOpen} />
                                        }}
                                        visible={emojiOpen}
                                        onClickOutside={() => {
                                            setEmojiOpen(false)
                                        }}
                                    >
                                        <Tippy content="Biểu tượng cảm xúc">
                                            <Button variant="ghost" size={'icon'} onClick={handleToggleEmojiOpen}>
                                                <Smile strokeWidth={1.5} size={24} className="size-6" />
                                            </Button>
                                        </Tippy>
                                    </HeadlessTippy>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button ref={submitButtonRef} className="w-full py-5" onClick={handleUploadPost}>
                                Đăng
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </div>
            </Dialog>
        </PopperWrapper>
    )
}

export default UploadPost
