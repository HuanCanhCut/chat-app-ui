import { forwardRef, LegacyRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import Reaction from './Reaction'
import Button from '~/components/Button'
import EmojiMessageStyle from '~/components/EmojiMessageStyle'
import { IncomingCallIcon, OutgoingCallIcon, TimeoutCallIcon } from '~/components/Icons/Icons'
import CustomImage from '~/components/Image/Image'
import * as messageServices from '~/services/messageService'
import { ConversationModel, LinkPreviewModel, MessageModel, MessageResponse, UserModel } from '~/type/type'
import openWindowCall from '~/utils/openWindowCall'

interface MessageContentProps {
    message: MessageModel
    messageIndex: number
    // eslint-disable-next-line no-unused-vars
    messageRef: (el: HTMLDivElement) => void
    currentUser: UserModel
    // eslint-disable-next-line no-unused-vars
    handleOpenReactionModal: (messageId: number) => void
    // eslint-disable-next-line no-unused-vars
    handleOpenImageModal: (url: string, messageId: number) => void
    messages: MessageResponse
    // eslint-disable-next-line no-unused-vars
    diffTime: (message: MessageModel, targetMessage: MessageModel) => number
    handleFormatTime: (time: Date) => string
    conversation?: ConversationModel
}

const BETWEEN_TIME_MESSAGE = 7 // minute

const linkRegex = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/

const MessageContent = (
    {
        message,
        messageIndex,
        messageRef,
        currentUser,
        handleOpenReactionModal,
        handleOpenImageModal,
        messages,
        diffTime,
        handleFormatTime,
        conversation,
    }: MessageContentProps,
    ref: LegacyRef<HTMLDivElement>,
) => {
    const { uuid } = useParams()

    const [linkPreview, setLinkPreview] = useState<LinkPreviewModel | null>(null)

    const combinedRef = (el: HTMLDivElement) => {
        if (messageIndex === 0) {
            if (ref) {
                if (typeof ref === 'function') {
                    ref(el)
                } else if (ref && typeof ref === 'object' && 'current' in ref) {
                    ;(ref as React.MutableRefObject<HTMLDivElement | null>).current = el
                }
            }
            messageRef(el)
        } else {
            messageRef(el)
        }
    }

    const consecutiveMessageStyle = () => {
        if (messages.data.length === 1) {
            return ''
        }

        let style = ''

        // Nếu là tin nhắn đầu tiên, cuối cùng, system hoặc có parent thì không cần style
        if (message.type.startsWith('system')) {
            return ''
        }

        const isCurrentUser = message.sender_id === currentUser?.id

        if (messageIndex >= messages.data.length - 1) {
            if (
                messages.data[messageIndex - 1].sender_id === message.sender_id &&
                diffTime(message, messages.data[messageIndex - 1]) < BETWEEN_TIME_MESSAGE &&
                !messages.data[messageIndex - 1].type.startsWith('system')
            ) {
                style += isCurrentUser ? ' rounded-br-[6px]' : ' rounded-bl-[6px]'
            }

            return style
        }

        const nextMessage = messages.data[messageIndex + 1]
        const isConsecutiveWithNext =
            nextMessage.sender_id === message.sender_id &&
            diffTime(message, nextMessage) < BETWEEN_TIME_MESSAGE &&
            !nextMessage.type.startsWith('system')

        if (messageIndex === 0) {
            if (isConsecutiveWithNext) {
                style += isCurrentUser ? ' rounded-tr-[6px]' : ' rounded-tl-[6px]'
            }

            return style
        }

        const prevMessage = messages.data[messageIndex - 1]

        const isConsecutiveWithPrev =
            prevMessage.sender_id === message.sender_id &&
            diffTime(message, prevMessage) < BETWEEN_TIME_MESSAGE &&
            !prevMessage.type.startsWith('system')

        if (message.parent) {
            if (prevMessage.parent) {
                return
            }
        }

        // Style for consecutive message with previous message
        if (isConsecutiveWithPrev) {
            style += isCurrentUser ? ' rounded-br-[6px]' : ' rounded-bl-[6px]'
        }

        // Style for consecutive message with next message
        if (isConsecutiveWithNext) {
            style += isCurrentUser ? ' rounded-tr-[6px]' : ' rounded-tl-[6px]'
        }

        // Style for first message in a group
        if (!isConsecutiveWithPrev && isConsecutiveWithNext) {
            style += isCurrentUser ? ' rounded-tr-[6px]' : ' rounded-tl-[6px]'
        }

        return style
    }

    useEffect(() => {
        if (message.type !== 'text') {
            return
        }

        const linkMatch = message.content?.match(linkRegex)

        if (linkMatch) {
            const link = linkMatch[0]

            ;(async () => {
                try {
                    const response = await messageServices.getLinkPreview({ urls: [link] })

                    if (response && response.data[0].success) {
                        setLinkPreview(response.data[0])
                    }
                } catch (error) {
                    console.log(error)
                }
            })()
        }
    }, [message.content, message.type])

    // message is revoked
    if (message.content === null) {
        return (
            <p
                ref={combinedRef}
                className={`relative w-fit max-w-[80%] rounded-3xl px-4 py-1.5 italic opacity-85 [word-break:break-word] ${
                    message.sender_id === currentUser?.id
                        ? 'bg-[var(--sender-light-background-color)] text-[var(--sender-light-text-color)] dark:bg-[var(--sender-dark-background-color)] dark:text-[var(--sender-dark-text-color)]'
                        : 'bg-[var(--receiver-light-background-color)] text-[var(--receiver-light-text-color)] dark:bg-[var(--receiver-dark-background-color)] dark:text-[var(--receiver-dark-text-color)]'
                } ${consecutiveMessageStyle()}`}
            >
                {message.sender.id === currentUser?.id ? 'Bạn ' : `${message.sender.full_name} `}
                đã thu hồi một tin nhắn
            </p>
        )
    }

    const handleCallAgain = () => {
        const otherMember = conversation?.members.find((member) => member.user_id !== currentUser?.id)

        if (!otherMember) {
            return
        }

        openWindowCall({
            memberNickname: otherMember.user.nickname,
            type: 'voice',
            conversationUuid: uuid as string,
            subType: 'caller',
        })
    }

    switch (message.type) {
        case 'text':
            return (
                <div className={`relative ${linkPreview?.image ? 'w-full max-w-[300px]' : 'w-fit max-w-[80%]'} `}>
                    <div
                        ref={combinedRef}
                        className={`whitespace-pre-wrap rounded-3xl px-4 py-1.5 font-normal [word-break:break-word] ${
                            message.sender_id === currentUser?.id
                                ? 'bg-[var(--sender-light-background-color)] text-[var(--sender-light-text-color)] dark:bg-[var(--sender-dark-background-color)] dark:text-[var(--sender-dark-text-color)]'
                                : 'bg-[var(--receiver-light-background-color)] text-[var(--receiver-light-text-color)] dark:bg-[var(--receiver-dark-background-color)] dark:text-[var(--receiver-dark-text-color)]'
                        } ${consecutiveMessageStyle()}`}
                    >
                        <span className="max-w-fit break-words">
                            <EmojiMessageStyle text={message.content} showLink={true} />
                        </span>
                    </div>
                    {linkPreview && (
                        <Link
                            href={linkPreview.url}
                            target="_blank"
                            className="block bg-[var(--receiver-light-background-color)] dark:bg-[var(--receiver-dark-background-color)]"
                        >
                            {linkPreview?.image && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={linkPreview.image}
                                    alt="link preview"
                                    className="aspect-video w-full object-cover"
                                />
                            )}
                            <div className="flex flex-col px-4 py-2">
                                <p className="line-clamp-3 overflow-hidden text-ellipsis font-medium">
                                    {linkPreview?.title}
                                </p>
                            </div>
                        </Link>
                    )}
                    <Reaction message={message} handleOpenReactionModal={handleOpenReactionModal} />
                </div>
            )
        case 'image':
            return (
                <div
                    ref={combinedRef}
                    className={`relative w-full rounded-2xl ${
                        JSON.parse(message.content as string).length > 1
                            ? 'max-w-[60%] sm:max-w-[55%] md:max-w-[50%] lg:max-w-[45%] xl:max-w-[35%]'
                            : 'max-w-[60%] sm:max-w-[40%] md:max-w-[35%] lg:max-w-[30%] xl:max-w-[25%]'
                    }`}
                >
                    <div
                        className={`flex w-full max-w-full flex-wrap gap-1 overflow-hidden rounded-2xl [word-break:break-word] ${consecutiveMessageStyle()}`}
                    >
                        {JSON.parse(message.content as string).map((url: string, index: number) => (
                            <div className="w-full max-w-full flex-1" key={index}>
                                <CustomImage
                                    src={url}
                                    alt="message"
                                    className={`max-h-[260px] sm:min-w-[100px] ${JSON.parse(message.content as string).length === 1 ? 'min-w-[180px]' : 'aspect-square'} h-full w-full min-w-[160px] !max-w-full cursor-pointer rounded-md object-cover object-center`}
                                    priority
                                    quality={100}
                                    onClick={() => handleOpenImageModal(url, message.id)}
                                />
                            </div>
                        ))}
                    </div>
                    <Reaction message={message} handleOpenReactionModal={handleOpenReactionModal} />
                </div>
            )
        case 'call_ended':
        case 'call_timeout':
            return (
                <div
                    ref={combinedRef}
                    className={
                        'w-[200px] rounded-2xl bg-[var(--reply-message-light-background-color)] p-3 dark:bg-[var(--reply-message-dark-background-color)]'
                    }
                >
                    <div className="flex items-center gap-2">
                        <Button
                            buttonType="icon"
                            className={`flex-shrink-0 ${message.type === 'call_timeout' ? '!bg-error dark:!bg-error' : ''}`}
                        >
                            {(() => {
                                switch (message.type) {
                                    case 'call_ended':
                                        return message.sender_id === currentUser?.id ? (
                                            <OutgoingCallIcon />
                                        ) : (
                                            <IncomingCallIcon />
                                        )
                                    case 'call_timeout':
                                        return <TimeoutCallIcon />
                                }
                            })()}
                        </Button>
                        <div className="flex flex-col">
                            <p className="font-medium">
                                {message.type === 'call_ended'
                                    ? `Cuộc gọi ${message.sender_id === currentUser?.id ? 'đi' : 'đến'}`
                                    : 'Đã bỏ lỡ cuộc gọi'}
                            </p>
                            <span className="text-xs text-systemMessageLight dark:text-systemMessageDark">
                                {message.type === 'call_ended'
                                    ? message.content
                                    : handleFormatTime(new Date(message.created_at))}
                            </span>
                        </div>
                    </div>
                    <Button buttonType="rounded" className="mt-3 w-full" onClick={handleCallAgain}>
                        Gọi lại
                    </Button>
                </div>
            )

        case 'icon':
            return (
                <div
                    ref={combinedRef}
                    className={`relative w-fit max-w-[80%] whitespace-pre-wrap rounded-3xl py-[2px] font-normal [word-break:break-word]`}
                >
                    <span className="max-w-fit break-words text-3xl">
                        <EmojiMessageStyle text={message.content} size={32} showLink={true} />
                    </span>

                    <Reaction message={message} handleOpenReactionModal={handleOpenReactionModal} />
                </div>
            )

        default:
            return null
    }
}

export default forwardRef(MessageContent)
