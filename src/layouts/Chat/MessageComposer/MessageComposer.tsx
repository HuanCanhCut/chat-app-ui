import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { Emoji as EmojiPicker, EmojiClickData, EmojiStyle } from 'emoji-picker-react'
import Tippy from 'huanpenguin-tippy-react'
import HeadlessTippy from 'huanpenguin-tippy-react/headless'
import pMap from 'p-map'
import { toast } from 'sonner'
import useSWR, { mutate } from 'swr'

import { faImage, faSmile } from '@fortawesome/free-regular-svg-icons'
import { faFolderPlus, faPlay, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Emoji from '~/components/Emoji'
import { SendHorizontalIcon } from '~/components/Icons'
import CustomImage from '~/components/Image/Image'
import SWRKey from '~/enum/SWRKey'
import { listenEvent, sendEvent } from '~/helpers/events'
import socket from '~/helpers/socket'
import uploadToCloudinary from '~/helpers/uploadToCloudinary'
import { selectCurrentUser } from '~/redux/selector'
import { useAppSelector } from '~/redux/types'
import * as cloudinaryService from '~/services/cloudinaryService'
import * as conversationServices from '~/services/conversationService'
import { ConversationMember, MessageMedia, MessageModel } from '~/type/type'
import { validateMedia } from '~/utils/validateMediaUpload'

interface InputMessageProps {
    className?: string
}

interface IFile extends File {
    preview?: string
}

const InputMessage: React.FC<InputMessageProps> = () => {
    const { uuid } = useParams()

    const currentUser = useAppSelector(selectCurrentUser)

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
    const [media, setMedia] = useState<IFile[]>([])
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
        const messageDetails = (
            type: string,
            content: string,
            media?: Pick<MessageMedia, 'media_type' | 'media_url'>[],
        ) => {
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
                    message_status: conversation?.data.members?.map((conversation) => {
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
                    parent_id: replyMessage?.id,
                    parent: replyMessage,
                    media: media || [],
                },
            }
        }

        if (!uuid) return

        // handle text message
        if (messageValue.trim().length) {
            const onlyIcon = new RegExp(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base})+$/u).test(
                messageValue.trim() as string,
            )

            socket.emit('NEW_MESSAGE', {
                conversation_uuid: conversationUuid,
                message: messageValue,
                type: onlyIcon ? 'icon' : 'text',
                parent_id: replyMessage?.id,
            })

            sendEvent('MESSAGE:SEND', null)
        }

        // handle image message
        if (media.length) {
            const { conversation_uuid, message } = messageDetails(
                'media',
                '',
                media.map((m) => {
                    return {
                        media_type: m.type.split('/')[0] as 'video' | 'image',
                        media_url: m.preview!,
                    }
                }),
            )

            setTimeout(
                () => {
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
                },
                messageValue.trim().length ? 500 : 0,
            )

            setMedia([])

            const folder = `chat-app-${process.env.NODE_ENV}/messages`

            const { data: signature } = await cloudinaryService.createCloudinarySignature({
                folder,
            })

            const payload = await pMap(
                media,
                async (m) => {
                    return uploadToCloudinary({ file: m, signature })
                },
                {
                    concurrency: 5,
                },
            )

            socket.emit('NEW_MESSAGE', {
                conversation_uuid,
                message: '',
                type: 'media',
                parent_id: replyMessage?.id,
                media: payload.map((item) => ({
                    media_url: item.secure_url,
                    media_type: item.resource_type,
                })),
            })

            sendEvent('MESSAGE:SEND', null)
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
        const remove = listenEvent('MESSAGE:ENTER-MESSAGE', ({ conversationUuid }) => {
            handleEmitMessage(conversationUuid)
        })

        return remove
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files

        if (files?.length) {
            const ACCEPTED_MEDIA = ['image/', 'video/']

            const { invalidFiles, validFiles } = validateMedia(files, ACCEPTED_MEDIA)

            if (invalidFiles.length > 0) {
                toast.error('Chỉ chấp nhận tải lên ảnh và video')
            }

            validFiles.forEach((file: IFile) => {
                // validate file max 10 MB
                if (file.size > 10 * 1024 * 1024) {
                    toast.error('File quá lớn, tối đa 10MB')
                    return
                }

                file.preview = URL.createObjectURL(file)
                setMedia((prev) => [...prev, file])
            })
        }

        // allow user to upload multiple images same name
        e.target.value = ''

        textareaRef.current?.focus()
    }

    useEffect(() => {
        return () => {
            media.forEach((file) => {
                file.preview && URL.revokeObjectURL(file.preview)
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // change height of textarea
        e.target.style.height = 'auto'
        e.target.style.height = e.target.scrollHeight + 'px'

        if (currentUser?.data) {
            // Only send when user enters the first letter, the following letters will not be sent.
            if (messageValue.trim().length === 0 && e.target.value.trim().length > 0) {
                socket.emit('MESSAGE_TYPING', {
                    conversation_uuid: uuid as string,
                    user_id: currentUser?.data.id,
                    is_typing: true,
                })
            }

            // Only send when user deletes all letters
            if (e.target.value.trim().length === 0) {
                socket.emit('MESSAGE_TYPING', {
                    conversation_uuid: uuid as string,
                    user_id: currentUser?.data.id,
                    is_typing: false,
                })
            }

            setMessageValue(e.target.value)
        }
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

    const handleRemoveMedia = (index: number) => {
        // revoke object url of image
        const imagePreview = media[index].preview

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview)
        }

        const newMedia = [...media]
        newMedia.splice(index, 1)
        setMedia(newMedia)
    }

    useEffect(() => {
        const remove = listenEvent('MESSAGE:REPLY', ({ message }) => {
            setReplyMessage(message)
            textareaRef.current?.focus()
        })

        return remove
    }, [])

    const handlePaste = (e: ClipboardEvent) => {
        if (!e.clipboardData) return

        for (const item of e.clipboardData.items) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const file = item.getAsFile() as IFile
                if (file) {
                    file.preview = URL.createObjectURL(file)
                    setMedia((prev) => [...prev, file])
                }
            }
        }
    }

    useEffect(() => {
        document.addEventListener('paste', handlePaste)

        return () => {
            document.removeEventListener('paste', handlePaste)
        }
    }, [])

    return (
        <div
            onKeyDown={handleEnterMessage}
            className="bg-(--background-theme-light-footer-color) dark:bg-(--background-theme-dark-footer-color)"
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
                        <p className="mt-1 line-clamp-2 w-[80%] overflow-hidden text-xs text-ellipsis text-zinc-600 sm:line-clamp-1 dark:text-zinc-400">
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
                <input ref={inputFileRef} id="image-input" type="file" hidden multiple onChange={handleUploadImage} />
                <div
                    className={`flex cursor-pointer items-center p-2 ${media.length > 0 || textareaRows() > 1 ? 'self-end' : 'self-center'}`}
                >
                    <Tippy delay={[200, 0]} content="Đính kèm hình ảnh có kích thước tối đa là 10MB">
                        <div className="flex-center" onClick={handleOpenUploadImage}>
                            <div className="cursor-pointer leading-none">
                                <FontAwesomeIcon icon={faImage} className="text-xl" />
                            </div>
                        </div>
                    </Tippy>
                </div>
                <div className="relative flex grow">
                    <div className="flex w-full flex-col justify-center">
                        {media.length > 0 && (
                            <div className="bg-light-gray flex w-full max-w-full items-center gap-3 overflow-x-auto rounded-t-2xl p-3 dark:bg-[#333334]">
                                <Tippy content="Tải lên hình ảnh khác" delay={[200, 0]}>
                                    <button
                                        className="flex-center dark:bg-dark-gray aspect-square h-12 w-12 cursor-pointer rounded-lg bg-zinc-300 hover:bg-transparent dark:hover:bg-transparent"
                                        onClick={handleOpenUploadImage}
                                    >
                                        <FontAwesomeIcon
                                            icon={faFolderPlus}
                                            fontSize={24}
                                            className="text-zinc-800 dark:text-white"
                                        />
                                    </button>
                                </Tippy>
                                {media.map((m, index) => {
                                    return (
                                        <div key={index} className="relative shrink-0">
                                            {(() => {
                                                switch (m.type.split('/')[0]) {
                                                    case 'image':
                                                        return (
                                                            <CustomImage
                                                                src={m.preview}
                                                                alt="image"
                                                                width={48}
                                                                height={48}
                                                                className="rounded-lg"
                                                                style={{
                                                                    objectFit: 'cover',
                                                                    width: '48px',
                                                                    height: '48px',
                                                                }}
                                                                priority
                                                                quality={100}
                                                            />
                                                        )
                                                    case 'video':
                                                        return (
                                                            <>
                                                                <div className="flex-center absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full">
                                                                    <FontAwesomeIcon icon={faPlay} />
                                                                </div>

                                                                <video
                                                                    className="h-12 w-12 rounded-lg object-cover"
                                                                    src={m.preview}
                                                                />
                                                            </>
                                                        )
                                                }
                                            })()}

                                            <button
                                                onClick={() => {
                                                    handleRemoveMedia(index)
                                                }}
                                                className="flex-center border-opacity-20 bg-light-gray absolute -top-2 -right-2 h-6 w-6 rounded-full border border-black p-1 hover:bg-[#e2e4e8] dark:bg-[#333334] dark:hover:bg-[#3c3c3d]"
                                            >
                                                <FontAwesomeIcon icon={faXmark} />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                        <textarea
                            className={`max-h-[140px] min-h-9 w-full resize-none rounded-3xl bg-(--receiver-light-background-color) px-4 py-1 pt-1.5 pr-12 text-(--receiver-light-text-color) outline-hidden dark:bg-(--receiver-dark-background-color) dark:text-(--receiver-dark-text-color) ${media.length && 'rounded-t-none'}`}
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
                        <span className="absolute bottom-2.5 left-4 bg-transparent leading-none text-gray-400">Aa</span>
                    )}
                    <HeadlessTippy
                        render={() => {
                            return (
                                <div tabIndex={-1}>
                                    <Emoji onEmojiClick={handleEmojiClick} isOpen={isOpenEmoji.emojiOpen} />
                                </div>
                            )
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
                                className="dark:hover:bg-dark-gray absolute right-1 bottom-1 rounded-full p-1 leading-px hover:bg-gray-300"
                                onClick={handleToggleEmoji}
                            >
                                <FontAwesomeIcon icon={faSmile} className="text-xl" />
                            </button>
                        </Tippy>
                    </HeadlessTippy>
                </div>
                <div
                    // prettier-ignore
                    className={`flex-center ${media.length > 0 || textareaRows() > 1 ? 'self-end' : 'self-center'}`}
                >
                    {messageValue.length || media.length > 0 ? (
                        <button
                            className="hover:bg-light-gray dark:hover:bg-dark-gray/30 cursor-pointer rounded-full p-2"
                            onClick={() => handleEmitMessage(uuid as string)}
                        >
                            <SendHorizontalIcon />
                        </button>
                    ) : (
                        <button
                            className="shrink-0 overflow-hidden text-xl"
                            onClick={() => {
                                const unified = conversation?.data.emoji
                                if (unified) {
                                    const emoji = String.fromCodePoint(parseInt(unified, 16))

                                    socket.emit('NEW_MESSAGE', {
                                        conversation_uuid: uuid as string,
                                        message: emoji,
                                        type: 'icon',
                                        parent_id: replyMessage?.id,
                                    })

                                    sendEvent('MESSAGE:SEND', null)
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
