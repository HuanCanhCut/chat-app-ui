import { useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Emoji as EmojiPicker, EmojiClickData } from 'emoji-picker-react'

import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from '~/components/Button'
import Emoji from '~/components/Emoji'
import handleApiError from '~/helpers/handleApiError'
import * as conversationServices from '~/services/conversationService'

interface ChangeEmojiModalProps {
    onClose: () => void
    currentEmoji?: string
}

const ChangeEmojiModal: React.FC<ChangeEmojiModalProps> = ({ onClose, currentEmoji }) => {
    const { uuid } = useParams()
    const handleSetEmoji = useCallback(
        async (emojiData: EmojiClickData) => {
            const emoji = emojiData.emoji

            try {
                await conversationServices.changeConversationEmoji({ uuid: uuid as string, emoji })
                onClose()
            } catch (error) {
                handleApiError(error)
            }
        },
        [onClose, uuid],
    )

    const handleRemoveEmoji = useCallback(async () => {
        try {
            await conversationServices.changeConversationEmoji({ uuid: uuid as string, emoji: '👍' })
            onClose()
        } catch (error: any) {
            handleApiError(error)
        }
    }, [onClose, uuid])

    return (
        <main className="w-[380px] max-w-full">
            <div className="flex items-center justify-between p-4 pb-0">
                <div className="flex flex-col items-start gap-1">
                    <span className="font-medium">Biểu tượng cảm xúc hiện tại</span>
                    <span>{currentEmoji && <EmojiPicker unified={currentEmoji} size={24} />}</span>
                </div>

                <Button
                    buttonType="rounded"
                    leftIcon={<FontAwesomeIcon icon={faXmark} />}
                    className="[&_[data-left-icon]]:text-xl"
                    onClick={handleRemoveEmoji}
                >
                    Gỡ
                </Button>
            </div>

            <Emoji
                className="!border-none !bg-[#252728] [&_.epr-emoji-category-label]:top-[-1px] [&_.epr-emoji-category-label]:bg-[#252728]"
                onEmojiClick={handleSetEmoji}
                isOpen={true}
            />
        </main>
    )
}

export default ChangeEmojiModal
