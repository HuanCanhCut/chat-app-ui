import { faSmile } from '@fortawesome/free-regular-svg-icons'
import React, { useEffect, useRef, useState } from 'react'
import { faImage } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Emoji from '~/components/Emoji'
import { EmojiClickData } from 'emoji-picker-react'
import Tippy from '@tippyjs/react'
import { useParams } from 'next/navigation'

import * as conversationServices from '~/services/conversationService'
import { SendHorizontalIcon } from '~/components/Icons'
import { listenEvent, sendEvent } from '~/helpers/events'
import socket from '~/helpers/socket'
import { SocketEvent } from '~/enum/SocketEvent'
import { faFolderPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import useSWR from 'swr'
import SWRKey from '~/enum/SWRKey'
import CustomImage from '~/components/Image/Image'

interface InputMessageProps {
    className?: string
}

interface IFile extends File {
    preview?: string
}

const InputMessage: React.FC<InputMessageProps> = () => {
    const { uuid } = useParams()

    const currentUser = useAppSelector(getCurrentUser)

    const { data: conversation } = useSWR(uuid ? [SWRKey.GET_CONVERSATION_BY_UUID, uuid] : null, () => {
        return conversationServices.getConversationByUuid({ uuid: uuid as string })
    })

    const inputRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const [messageValue, setMessageValue] = useState('')
    const [isOpenEmoji, setIsOpenEmoji] = useState(false)
    const [images, setImages] = useState<IFile[]>([])

    const handleEnterMessage = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            handleEmitMessage(uuid as string)
        }
    }

    const handleEmitMessage = async (conversationUuid: string) => {
        const messageDetails = (type: string, content: string) => {
            return {
                conversationUuid,
                message: {
                    content: content,
                    sender_id: currentUser.data.id,
                    type,
                    is_preview: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    sender: currentUser.data,
                    message_status: conversation?.data.conversation_members.map((conversation) => {
                        return {
                            receiver_id: conversation.user_id,
                            status: 'sending',
                            is_revoked: false,
                            revoked_type: null,
                            read_at: null,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            receiver: conversation.user,
                        }
                    }),
                },
            }
        }

        if (!uuid) return

        if (messageValue.trim().length) {
            socket.emit(SocketEvent.NEW_MESSAGE, { conversationUuid, message: messageValue, type: 'text' })

            sendEvent({
                eventName: 'message:emit-message',
                detail: messageDetails('text', messageValue),
            })
        }

        if (images.length) {
            const uploadToCloudinary = async (file: File, folder: string, publicId: string) => {
                const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string

                const formData = new FormData()
                formData.append('file', file)
                formData.append('upload_preset', UPLOAD_PRESET)
                formData.append('folder', folder)
                formData.append('public_id', publicId)

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload`,
                    {
                        method: 'POST',
                        body: formData,
                    },
                )

                return await response.json()
            }

            sendEvent({
                eventName: 'message:emit-message',
                detail: messageDetails(
                    'image',
                    JSON.stringify(
                        images.map((image) => {
                            return image.preview
                        }),
                    ),
                ),
            })

            setImages([])

            const payload = await Promise.all(
                images.map((image) =>
                    uploadToCloudinary(
                        image,
                        'chat-app/message',
                        `${uuid}-${image.name}-${Math.random().toString().substring(2, 15)}`,
                    ),
                ),
            )

            socket.emit(SocketEvent.NEW_MESSAGE, {
                conversationUuid,
                message: JSON.stringify(payload.map((item) => item.secure_url)),
                type: 'image',
            })
        }

        setMessageValue('')
    }

    const handleToggleEmoji = () => {
        setIsOpenEmoji(!isOpenEmoji)
    }

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setMessageValue((prev) => prev + emojiData.emoji)
    }

    useEffect(() => {
        const remove = listenEvent({
            eventName: 'message:enter-message',
            handler: ({ detail: conversationUuid }) => {
                handleEmitMessage(conversationUuid as string)
            },
        })

        return remove
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files

        if (files?.length) {
            Array.from(files).forEach((file: IFile) => {
                file.preview = URL.createObjectURL(file)
                setImages((prev) => [...prev, file])
            })
        }

        // allow user to upload multiple images same name
        e.target.value = ''
    }

    useEffect(() => {
        return () => {
            images.forEach((file) => {
                file.preview && URL.revokeObjectURL(file.preview)
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // change height of textarea
        e.target.style.height = 'auto'
        e.target.style.height = e.target.scrollHeight + 'px'
        setMessageValue(e.target.value)
    }

    const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        e.stopPropagation()

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleEmitMessage(uuid as string)
        }
    }

    const textareaRows = () => {
        if (!textareaRef.current) return 1
        return textareaRef.current?.value.split('\n').length
    }

    const handleOpenUploadImage = () => {
        inputRef.current?.click()
    }

    const handleRemoveImage = (index: number) => {
        // revoke object url of image
        images[index].preview && URL.revokeObjectURL(images[index].preview)

        const newImages = [...images]
        newImages.splice(index, 1)
        setImages(newImages)
    }

    return (
        <div className="flex items-center justify-between gap-2 p-2 pb-4 pt-0" onKeyDown={handleEnterMessage}>
            <input
                ref={inputRef}
                id="image-input"
                type="file"
                accept="image/*"
                hidden
                multiple
                onChange={handleUploadImage}
            />
            <div
                className={`flex cursor-pointer items-center p-2 ${images.length > 0 || textareaRows() > 1 ? 'self-end' : 'self-center'}`}
            >
                <Tippy delay={[200, 0]} content="Đính kèm hình ảnh có kích thước tối đa là 10MB">
                    <div className="flex-center" onClick={handleOpenUploadImage}>
                        <div className="cursor-pointer leading-none">
                            <FontAwesomeIcon icon={faImage} className="text-xl" />
                        </div>
                    </div>
                </Tippy>
            </div>
            <div className="relative flex flex-grow">
                <div className="flex w-full flex-col justify-center">
                    {images.length > 0 && (
                        <div className="flex w-full max-w-full items-center gap-3 overflow-x-auto rounded-t-2xl bg-lightGray p-3 dark:bg-[#333334]">
                            <Tippy content="Tải lên hình ảnh khác" delay={[200, 0]}>
                                <button
                                    className="flex-center aspect-square h-12 w-12 cursor-pointer rounded-lg bg-zinc-300 hover:bg-transparent dark:bg-darkGray dark:hover:bg-transparent"
                                    onClick={handleOpenUploadImage}
                                >
                                    <FontAwesomeIcon
                                        icon={faFolderPlus}
                                        fontSize={24}
                                        className="text-zinc-800 dark:text-white"
                                    />
                                </button>
                            </Tippy>
                            {images.map((image, index) => {
                                return (
                                    <div key={index} className="relative flex-shrink-0">
                                        <CustomImage
                                            src={image.preview}
                                            alt="image"
                                            width={48}
                                            height={48}
                                            className="rounded-lg"
                                            style={{ objectFit: 'cover', width: '48px', height: '48px' }}
                                            priority
                                            quality={100}
                                        />
                                        <button
                                            onClick={() => {
                                                handleRemoveImage(index)
                                            }}
                                            className="flex-center absolute right-[-8px] top-[-8px] h-6 w-6 rounded-full border border-black border-opacity-20 bg-lightGray p-1 hover:bg-[#e2e4e8] dark:bg-[#333334] dark:hover:bg-[#3c3c3d]"
                                        >
                                            <FontAwesomeIcon icon={faXmark} />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    <textarea
                        className={`max-h-[140px] min-h-[36px] w-full resize-none rounded-3xl bg-lightGray px-4 py-1 pr-12 pt-[6px] outline-none dark:bg-[#333334] ${images.length && 'rounded-t-none'}`}
                        value={messageValue}
                        autoFocus
                        onChange={handleInputChange}
                        onKeyDown={handleTextareaKeyDown}
                        rows={1}
                        ref={textareaRef}
                    />
                </div>
                {/* show placeholder if messageValue is empty */}
                {messageValue.trim() === '' && textareaRows() === 1 && (
                    <span className="absolute bottom-[10px] left-4 bg-transparent leading-none text-gray-400">Aa</span>
                )}
                <Emoji isOpen={isOpenEmoji} setIsOpen={setIsOpenEmoji} onEmojiClick={handleEmojiClick}>
                    <Tippy content="Chọn biểu tượng cảm xúc">
                        <button
                            className="absolute bottom-1 right-1 rounded-full p-1 leading-[1px] hover:bg-gray-300 dark:hover:bg-darkGray"
                            onClick={handleToggleEmoji}
                        >
                            <FontAwesomeIcon icon={faSmile} className="text-xl" />
                        </button>
                    </Tippy>
                </Emoji>
            </div>
            <div
                // prettier-ignore
                className={`flex-center ${images.length > 0 || textareaRows() > 1 ? 'self-end' : 'self-center'}`}
            >
                {messageValue.length || images.length > 0 ? (
                    <button
                        className="rounded-full p-2 hover:bg-lightGray dark:hover:bg-darkGray"
                        onClick={() => handleEmitMessage(uuid as string)}
                    >
                        <SendHorizontalIcon />
                    </button>
                ) : (
                    <button className="text-xl">🤣</button>
                )}
            </div>
        </div>
    )
}

export default InputMessage
