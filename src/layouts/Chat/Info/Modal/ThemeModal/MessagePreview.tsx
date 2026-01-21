import { useSelector } from 'react-redux'

import { getCurrentTheme } from '~/redux/selector'
import { ConversationThemeModel } from '~/type/type'

interface MessagePreviewProps {
    content: string
    index: number
    currentTheme: ConversationThemeModel
    type: 'sender' | 'receiver' | 'system'
}

const MessagePreview: React.FC<MessagePreviewProps> = ({ content, index, currentTheme, type }) => {
    const theme: 'light' | 'dark' = useSelector(getCurrentTheme)

    return (
        <div
            className={`mt-px max-w-[80%] ${type === 'system' ? 'flex-center max-w-full' : type === 'receiver' ? 'mt-2!' : 'self-end'}`}
        >
            <p
                className={`rounded-2xl p-2 text-[15px] ${type === 'system' ? 'text-system-message-light dark:text-system-message-dark text-xs font-medium' : ''} ${index === 0 ? 'rounded-br-[4px]!' : index === 1 ? 'rounded-tr-[4px]!' : ''}`}
                style={{
                    backgroundColor:
                        type !== 'system' ? currentTheme.theme_config[type][theme].background_color : 'transparent',
                    color: type !== 'system' ? currentTheme.theme_config[type][theme].text_color : 'inherit',
                }}
            >
                {type === 'system'
                    ? new Date(content).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    : content}
            </p>
        </div>
    )
}

export default MessagePreview
