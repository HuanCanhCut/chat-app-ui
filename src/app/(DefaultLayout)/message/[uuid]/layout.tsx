import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Message | Huấn Cánh Cụt',
    description: 'Message Huấn Cánh Cụt',
}

const ChatLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <>{children}</>
}

export default ChatLayout
