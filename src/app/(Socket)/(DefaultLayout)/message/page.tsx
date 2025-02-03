import NoChatSelected from './NoChatSelected'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Message | Huấn Cánh Cụt',
    description: 'Message Huấn Cánh Cụt',
}

const Message: React.FC = () => {
    return <NoChatSelected />
}

export default Message
