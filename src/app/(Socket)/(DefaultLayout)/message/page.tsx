import { Metadata } from 'next'

import NoChatSelected from './NoChatSelected'

export const metadata: Metadata = {
    title: 'Message | Huấn Cánh Cụt',
    description: 'Message Huấn Cánh Cụt',
}

const Message: React.FC = () => {
    return <NoChatSelected />
}

export default Message
