import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { Emoji as EmojiPicker, EmojiClickData, EmojiStyle } from 'emoji-picker-react'
import useSWR, { mutate } from 'swr'

import { faImage, faSmile } from '@fortawesome/free-regular-svg-icons'
import { faFolderPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@tippyjs/react'
import HeadlessTippy from '@tippyjs/react/headless'
import Emoji from '~/components/Emoji'
import { SendHorizontalIcon } from '~/components/Icons'
import CustomImage from '~/components/Image/Image'
import { SocketEvent } from '~/enum/SocketEvent'
import SWRKey from '~/enum/SWRKey'
import { listenEvent, sendEvent } from '~/helpers/events'
import socket from '~/helpers/socket'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import * as conversationServices from '~/services/conversationService'
import { ConversationMember, MessageModel } from '~/type/type'

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

    const inputFileRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const [messageValue, setMessageValue] = useState('')
    const [isOpenEmoji, setIsOpenEmoji] = useState({
        emojiOpen: false,
        emojiWrapperOpen: false,
    })
    const [images, setImages] = useState<IFile[]>([])
    const [replyMessage, setReplyMessage] = useState<MessageModel | null>(null)

    const memberMap = useMemo(() => {
        const member: ConversationMember[] = conversation?.data.members || []

        return member.reduce(
            (mem, cur) => {
                mem[cur.user_id] = cur
                return mem
            },
            {} as Record<number, ConversationMember>,
        )
    }, [conversation?.data.members])

    const handleEnterMessage = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            handleEmitMessage(uuid as string)
        }
    }

    const handleEmitMessage = async (conversationUuid: string) => {
        const messageDetails = (type: string, content: string) => {
            return {
                conversation_uuid: conversationUuid,
                message: {
                    id: Math.random(),
                    content: content,
                    sender_id: currentUser?.data.id,
                    type,
                    is_preview: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    sender: currentUser?.data,
                    message_status: conversation?.data.members.map((conversation) => {
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

        // handle text message
        if (messageValue.trim().length) {
            const onlyIcon = new RegExp(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base})+$/u).test(
                messageValue.trim() as string,
            )

            socket.emit(SocketEvent.NEW_MESSAGE, {
                conversation_uuid: conversationUuid,
                message: messageValue,
                type: onlyIcon ? 'icon' : 'text',
                parent_id: replyMessage?.id,
            })

            sendEvent({
                eventName: 'message:send',
            })
        }

        // handle image message
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

            const { conversation_uuid, message } = messageDetails(
                'image',
                JSON.stringify(
                    images.map((image) => {
                        return image.preview
                    }),
                ),
            )

            mutate(
                [SWRKey.GET_MESSAGES, uuid as string],
                (prev: any) => {
                    if (!prev) return prev
                    return {
                        data: [message as unknown as MessageModel, ...prev.data],
                        meta: prev.meta,
                    }
                },
                {
                    revalidate: false,
                },
            )

            setImages([])

            const payload = await Promise.all(
                images.map((image) =>
                    uploadToCloudinary(
                        image,
                        `chat-app-${process.env.NODE_ENV}/messages`,
                        `${uuid}-${image.name}-${Math.random().toString().substring(2, 15)}`,
                    ),
                ),
            )

            socket.emit(SocketEvent.NEW_MESSAGE, {
                conversation_uuid,
                message: JSON.stringify(payload.map((item) => item.secure_url)),
                type: 'image',
            })

            sendEvent({
                eventName: 'message:send',
            })
        }

        setMessageValue('')
        setReplyMessage(null)
        // Reset chiều cao và rows của textarea về mặc định
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.rows = 1
            textareaRef.current.value = ''
        }
    }

    const handleToggleEmoji = () => {
        setIsOpenEmoji((prev) => ({
            ...prev,
            emojiOpen: true,
            emojiWrapperOpen: !prev.emojiWrapperOpen,
        }))
    }

    const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
        setMessageValue((prev) => prev + emojiData.emoji)
    }, [])

    useEffect(() => {
        const remove = listenEvent({
            eventName: 'message:enter-message',
            handler: ({ detail }: { detail: { conversationUuid: string } }) => {
                handleEmitMessage(detail.conversationUuid)
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

        // Only send when user enters the first letter, the following letters will not be sent.
        if (messageValue.trim().length === 0 && e.target.value.trim().length > 0) {
            socket.emit(SocketEvent.MESSAGE_TYPING, {
                conversation_uuid: uuid as string,
                user_id: currentUser?.data.id,
                is_typing: true,
            })
        }

        // Only send when user deletes all letters
        if (e.target.value.trim().length === 0) {
            socket.emit(SocketEvent.MESSAGE_TYPING, {
                conversation_uuid: uuid as string,
                user_id: currentUser?.data.id,
                is_typing: false,
            })
        }

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
        inputFileRef.current?.click()
    }

    const handleRemoveImage = (index: number) => {
        // revoke object url of image
        const imagePreview = images[index].preview

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview)
        }

        const newImages = [...images]
        newImages.splice(index, 1)
        setImages(newImages)
    }

    useEffect(() => {
        const remove = listenEvent({
            eventName: 'message:reply',
            handler: ({ detail }: { detail: MessageModel }) => {
                setReplyMessage(detail)
                textareaRef.current?.focus()
            },
        })

        return remove
    }, [])

    return (
        <div
            onKeyDown={handleEnterMessage}
            className="bg-[var(--background-theme-light-footer-color)] dark:bg-[var(--background-theme-dark-footer-color)]"
        >
            {replyMessage && (
                <div className="flex items-center justify-between border-t border-zinc-300 px-4 py-2 pt-1 dark:border-zinc-700">
                    <div className="flex-1">
                        <span className="text-sm text-zinc-800 dark:text-zinc-200">
                            Đang trả lời{' '}
                            {replyMessage.sender_id === currentUser?.data.id
                                ? 'chính mình'
                                : (memberMap && memberMap[replyMessage.sender_id]?.nickname) ||
                                  (memberMap && memberMap[replyMessage.sender_id]?.user.full_name)}
                        </span>
                        <p className="mt-1 line-clamp-2 w-[80%] overflow-hidden text-ellipsis text-xs text-zinc-600 dark:text-zinc-400 sm:line-clamp-1">
                            {replyMessage.type === 'text' ? replyMessage.content : 'Hình ảnh'}
                        </p>
                    </div>
                    <button
                        className="flex-center h-7 w-7 rounded-full p-1 text-lg text-zinc-600 hover:bg-[rgba(0,0,0,0.05)] dark:text-zinc-400 dark:hover:bg-[rgba(255,255,255,0.05)]"
                        onClick={() => setReplyMessage(null)}
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
            )}
            <div className="flex w-full items-center justify-between gap-2 px-2 py-4 pt-2">
                <input
                    ref={inputFileRef}
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
                            spellCheck={false}
                        />
                    </div>
                    {/* show placeholder if messageValue is empty */}
                    {messageValue === '' && textareaRows() === 1 && (
                        <span className="absolute bottom-[10px] left-4 bg-transparent leading-none text-gray-400">
                            Aa
                        </span>
                    )}
                    <HeadlessTippy
                        render={(...attrs) => {
                            return <Emoji {...attrs} onEmojiClick={handleEmojiClick} isOpen={isOpenEmoji.emojiOpen} />
                        }}
                        onClickOutside={() =>
                            setIsOpenEmoji((prev) => ({ ...prev, emojiOpen: true, emojiWrapperOpen: false }))
                        }
                        placement="top-start"
                        offset={[0, 15]}
                        interactive
                        visible={isOpenEmoji.emojiWrapperOpen}
                    >
                        <Tippy content="Chọn biểu tượng cảm xúc">
                            <button
                                className="absolute bottom-1 right-1 rounded-full p-1 leading-[1px] hover:bg-gray-300 dark:hover:bg-darkGray"
                                onClick={handleToggleEmoji}
                            >
                                <FontAwesomeIcon icon={faSmile} className="text-xl" />
                            </button>
                        </Tippy>
                    </HeadlessTippy>
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
                        <button
                            className="flex-shrink-0 overflow-hidden text-xl"
                            onClick={() => {
                                const unified = conversation?.data.emoji
                                if (unified) {
                                    const emoji = String.fromCodePoint(parseInt(unified, 16))

                                    socket.emit(SocketEvent.NEW_MESSAGE, {
                                        conversation_uuid: uuid,
                                        message: emoji,
                                        type: 'icon',
                                        parent_id: replyMessage?.id,
                                    })

                                    sendEvent({
                                        eventName: 'message:send',
                                    })
                                }
                            }}
                        >
                            <EmojiPicker
                                unified={conversation?.data.emoji || '1f44d'} // default 👍
                                size={24}
                                emojiStyle={EmojiStyle.FACEBOOK}
                            />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default memo(InputMessage)
