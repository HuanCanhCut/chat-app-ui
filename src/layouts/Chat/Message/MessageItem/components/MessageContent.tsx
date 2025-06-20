import { forwardRef, LegacyRef } from 'react'
import { MessageModel, MessageResponse, UserModel } from '~/type/type'
import Reaction from './Reaction'
import CustomImage from '~/components/Image/Image'
import EmojiMessageStyle from '~/components/EmojiMessageStyle'

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
}

const BETWEEN_TIME_MESSAGE = 7 // minute

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
    }: MessageContentProps,
    ref: LegacyRef<HTMLDivElement>,
) => {
    const consecutiveMessageStyle = () => {
        let style = ''

        // Nếu là tin nhắn đầu tiên, cuối cùng, system hoặc có parent thì không cần style
        if (message.type.startsWith('system')) {
            return ''
        }

        const isCurrentUser = message.sender_id === currentUser?.id

        if (messageIndex >= messages.data.length - 1) {
            if (
                messages.data[messageIndex - 1].sender_id === message.sender_id &&
                diffTime(message, messages.data[messageIndex - 1]) < BETWEEN_TIME_MESSAGE
            ) {
                style += isCurrentUser ? ' rounded-br-[6px]' : ' rounded-bl-[6px]'
            }

            return style
        }

        const nextMessage = messages.data[messageIndex + 1]
        const isConsecutiveWithNext =
            nextMessage.sender_id === message.sender_id && diffTime(message, nextMessage) < BETWEEN_TIME_MESSAGE

        if (messageIndex === 0) {
            if (isConsecutiveWithNext) {
                style += isCurrentUser ? ' rounded-tr-[6px]' : ' rounded-tl-[6px]'
            }

            return style
        }

        const prevMessage = messages.data[messageIndex - 1]

        const isConsecutiveWithPrev =
            prevMessage.sender_id === message.sender_id && diffTime(message, prevMessage) < BETWEEN_TIME_MESSAGE

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

    // message is revoked
    if (message.content === null) {
        return (
            <p
                ref={messageIndex === 0 ? ref : messageRef}
                className={`relative w-fit max-w-[80%] rounded-3xl px-4 py-1.5 font-light italic opacity-85 [word-break:break-word] ${
                    message.sender_id === currentUser?.id
                        ? 'bg-milk-tea text-zinc-300'
                        : 'bg-lightGray text-zinc-600 dark:bg-[#313233] dark:text-zinc-400'
                } ${consecutiveMessageStyle()}`}
            >
                {message.sender.id === currentUser?.id ? 'Bạn ' : `${message.sender.full_name} `}
                đã thu hồi một tin nhắn
            </p>
        )
    }

    switch (message.type) {
        case 'text':
            return (
                <div
                    ref={messageIndex === 0 ? ref : messageRef}
                    className={`relative w-fit max-w-[80%] whitespace-pre-wrap rounded-3xl px-4 py-1.5 font-light [word-break:break-word] ${
                        message.sender_id === currentUser?.id
                            ? 'bg-milk-tea text-white'
                            : 'bg-lightGray text-black dark:bg-[#313233] dark:text-dark'
                    } ${consecutiveMessageStyle()}`}
                >
                    <span className="max-w-fit break-words">
                        <EmojiMessageStyle text={message.content} />
                    </span>

                    <Reaction message={message} handleOpenReactionModal={handleOpenReactionModal} />
                </div>
            )
        case 'image':
            return (
                <div
                    ref={messageIndex === 0 ? ref : messageRef}
                    className={`relative w-full rounded-2xl ${
                        JSON.parse(message.content as string).length > 1
                            ? 'max-w-[60%] sm:max-w-[55%] md:max-w-[50%] lg:max-w-[45%] xl:max-w-[35%]'
                            : 'max-w-[60%] sm:max-w-[40%] md:max-w-[35%] lg:max-w-[30%] xl:max-w-[25%]'
                    }`}
                >
                    <div
                        className={`flex w-full flex-wrap gap-1 overflow-hidden rounded-2xl [word-break:break-word] ${consecutiveMessageStyle()}`}
                    >
                        {JSON.parse(message.content as string).map((url: string, index: number) => (
                            <div className="flex-1" key={index}>
                                <CustomImage
                                    src={url}
                                    alt="message"
                                    className={`max-h-[260px] sm:min-w-[150px] ${JSON.parse(message.content as string).length === 1 ? 'min-w-[240px]' : 'aspect-square'} h-full w-full min-w-[180px] cursor-pointer rounded-md object-cover`}
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
        case 'icon':
            return (
                <div
                    ref={messageIndex === 0 ? ref : messageRef}
                    className={`relative w-fit max-w-[80%] whitespace-pre-wrap rounded-3xl py-[2px] font-light [word-break:break-word]`}
                >
                    <span className="max-w-fit break-words text-3xl">
                        <EmojiMessageStyle text={message.content} size={32} />
                    </span>

                    <Reaction message={message} handleOpenReactionModal={handleOpenReactionModal} />
                </div>
            )

        default:
            return null
    }
}

export default forwardRef(MessageContent)
