import { forwardRef } from 'react'
import { MessageModel } from '~/type/type'

interface SystemMessageProps {
    message: MessageModel
    messageIndex: number
}

const SystemMessage = ({ message, messageIndex }: SystemMessageProps, ref: React.Ref<HTMLDivElement>) => {
    return (
        <div className="flex justify-center" ref={messageIndex === 0 ? ref : null}>
            <p className="text-center text-xs text-gray-400">{message.content}</p>
        </div>
    )
}

export default forwardRef(SystemMessage)
