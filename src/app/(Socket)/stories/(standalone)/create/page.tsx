'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Image as ImageIcon, Video } from 'lucide-react'
import { toast } from 'sonner'

import Sidebar from './components/Sidebar'
import handleApiError from '~/helpers/handleApiError'
import uploadToCloudinary from '~/helpers/uploadToCloudinary'
import Interaction from '~/layouts/Header/Interaction'
import { cn } from '~/lib/utils'
import * as cloudinaryService from '~/services/cloudinaryService'
import * as storyServices from '~/services/storyService'

interface IFile extends File {
    preview?: string
}

const CreateStoryPage = () => {
    const [selectedType, setSelectedType] = useState<'text' | 'image' | 'video' | null>(null)
    const [selectedBackground, setSelectedBackground] = useState<string | null>(
        'https://res.cloudinary.com/dkmwrkngj/image/upload/v1775720869/64502458_318989065695201_361648744678031360_n_nnnwx0.jpg',
    )

    const [caption, setCaption] = useState<string>('')
    const [file, setFile] = useState<IFile>()

    const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = e.target.files?.[0] as IFile

        if (file) {
            const preview = URL.createObjectURL(file)

            file.preview = preview

            setFile(file)
        }

        setSelectedType(type)
    }

    const handleSubmit = async () => {
        let toastId = null

        try {
            if (!selectedType) return

            if (selectedType !== 'text' && !file) {
                toast.error('Vui lòng tải lên file')
                return
            }

            toastId = toast.loading('Story của bạn đang được tải lên, vui lòng không thoát khỏi trang này', {
                duration: 10000, // 10 seconds
            })

            const { data: signature } = await cloudinaryService.createCloudinarySignature({
                folder: `chat-app-${process.env.NODE_ENV}/stories`,
            })

            let url = selectedBackground

            if (selectedType !== 'text' && file) {
                const response = await uploadToCloudinary({
                    file,
                    signature,
                })

                url = response.secure_url
            }

            if (url) {
                await storyServices.createStory({
                    type: selectedType,
                    url,
                    caption,
                })
            }

            toast.success('Story của bạn đã được tải lên thành công', {
                id: toastId,
            })
        } catch (error) {
            if (toastId) {
                handleApiError(error, undefined, toastId.toString())
            } else {
                handleApiError(error)
            }
        }
    }

    return (
        <div className="dark:bg-dark bg-light-gray relative flex h-dvh">
            <div className="absolute top-2 right-3 z-10">
                <Interaction />
            </div>
            <Sidebar
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                selectedBackground={selectedBackground}
                setSelectedBackground={setSelectedBackground}
                caption={caption}
                onSubmit={handleSubmit}
            />

            <div className="flex-center flex-1 gap-6 px-2 py-14 select-none">
                {selectedType === null ? (
                    <>
                        <div
                            className="flex aspect-9/14 w-[220px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md bg-linear-120 from-[#6348ee] to-[#8ad6fe] hover:brightness-95"
                            onClick={() => {
                                setSelectedType('text')
                            }}
                        >
                            <div className="dark:bg-dark bg-light-gray flex-center size-12 rounded-full font-medium">
                                Aa
                            </div>
                            <p className="font-medium text-white">Tạo tin bằng văn bản</p>
                        </div>

                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            name=""
                            id="story_image_file"
                            onChange={(e) => {
                                handleUploadFile(e, 'image')
                            }}
                        />
                        <label
                            htmlFor="story_image_file"
                            className="flex aspect-9/14 w-[220px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md bg-linear-120 from-[#ab4ad6] to-[#e25388] hover:brightness-95"
                        >
                            <div className="dark:bg-dark bg-light-gray flex-center size-12 rounded-full font-medium">
                                <ImageIcon />
                            </div>
                            <p className="font-medium text-white">Tạo tin bằng hình ảnh</p>
                        </label>

                        <input
                            type="file"
                            hidden
                            accept="video/*"
                            name=""
                            id="story_video_file"
                            onChange={(e) => {
                                handleUploadFile(e, 'video')
                            }}
                        />
                        <label
                            htmlFor="story_video_file"
                            className="flex aspect-9/14 w-[220px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md bg-linear-120 from-[#3FBB46] to-[#14B898] hover:brightness-95"
                        >
                            <div className="dark:bg-dark bg-light-gray flex-center size-12 rounded-full font-medium">
                                <Video />
                            </div>
                            <p className="font-medium text-white">Tạo tin bằng video</p>
                        </label>
                    </>
                ) : (
                    <div className="dark:bg-dark-gray bg-light-gray flex h-full w-200 max-w-[calc(100%-40px)] flex-col overflow-hidden rounded-lg p-6 pt-4 shadow-lg shadow-black/20">
                        <p className="font-medium">Xem trước</p>
                        <div className="bg-dark flex-center mt-4 h-full max-h-full w-full rounded-lg p-2">
                            <div className="aspect-9/16 h-full max-h-full overflow-hidden rounded-md">
                                <div className="flex-center h-full w-full max-w-[440px] overflow-hidden">
                                    {(() => {
                                        switch (selectedType) {
                                            case 'text':
                                                return (
                                                    <div
                                                        className="flex-center h-full w-full"
                                                        style={{ backgroundImage: `url('${selectedBackground}')` }}
                                                    >
                                                        <div
                                                            defaultValue={' '}
                                                            aria-valuetext={caption}
                                                            contentEditable
                                                            suppressContentEditableWarning
                                                            className={cn(
                                                                'flex-center mt-4 h-[300px] w-full max-w-full rounded-md border-none px-4 text-center text-2xl leading-[300px] font-bold [word-break:break-word] outline-none',
                                                                {
                                                                    'leading-normal': caption,
                                                                },
                                                            )}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    const lines =
                                                                        e.currentTarget.innerText.split('\n').length ??
                                                                        0
                                                                    if (lines >= 5) {
                                                                        e.preventDefault()
                                                                    }
                                                                }
                                                            }}
                                                            onInput={(e: React.FormEvent<HTMLDivElement>) => {
                                                                setCaption(e.currentTarget.innerText)
                                                            }}
                                                        ></div>
                                                    </div>
                                                )
                                            case 'image':
                                                return (
                                                    <>
                                                        {file && file.preview && (
                                                            <Image
                                                                src={file.preview}
                                                                alt="preview"
                                                                className="h-full w-full rounded-md object-cover"
                                                                width={400}
                                                                height={400}
                                                            />
                                                        )}
                                                    </>
                                                )
                                            case 'video':
                                                return (
                                                    <video
                                                        src={file?.preview}
                                                        autoPlay
                                                        className="h-full max-h-full w-full rounded-md object-cover"
                                                    />
                                                )
                                        }
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CreateStoryPage
