import { Metadata } from 'next'
import NoChatSelected from './NoChatSelected'

export const metadata: Metadata = {
    title: 'Message | Huấn Cánh Cụt',
    description: 'Message Huấn Cánh Cụt',
}

const Message: React.FC = () => {
    return (
        <div className="[overflow: overlay] h-full max-h-[calc(100vh-var(--header-mobile-height))] sm:max-h-[calc(100vh-var(--header-height))]">
            <NoChatSelected />
        </div>
    )
}

export default Message
