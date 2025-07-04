import { forwardRef } from 'react'

import { sendEvent } from '~/helpers/events'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import { MessageModel } from '~/type/type'

interface SystemMessageProps {
    message: MessageModel
    messageIndex: number
    className?: string
}

const SystemMessage = (
    { message, messageIndex, className = '' }: SystemMessageProps,
    ref: React.Ref<HTMLDivElement>,
) => {
    const currentUser = useAppSelector(getCurrentUser)

    const handleQuickAction = () => {
        sendEvent({
            eventName: 'theme:open-modal',
        })
    }

    const handleReplaceJson = (text: string) => {
        interface JsonParsed {
            user_id: string | number
            name: string
        }

        const jsx: (string | JSX.Element)[] = []

        const regex = /\{(.*?)\}/g
        let lastIndex = 0

        for (const match of message.content?.matchAll(regex) || []) {
            const json = match[0]

            const jsonParsed: JsonParsed = JSON.parse(json)

            const matchIndex = match.index || 0

            jsx.push(<span key={`text-${Math.random()}`}>{text.slice(lastIndex, matchIndex)}</span>)

            jsx.push(
                <span key={`text-${Math.random()}`}>
                    {(() => {
                        if (Number(jsonParsed.user_id) === currentUser.data.id) {
                            return matchIndex === 0 ? 'Bạn' : 'bạn'
                        }

                        return jsonParsed.name
                    })()}
                </span>,
            )

            lastIndex = matchIndex + json.length
        }

        jsx.push(<span key={`text-end`}>{text.slice(lastIndex)}</span>)

        if (message.type === 'system_change_theme') {
            jsx.push(
                <span key={`quick-action`}>
                    <span
                        className="cursor-pointer select-none font-medium text-[var(--sender-light-background-color)] hover:underline dark:text-[var(--sender-dark-background-color)]"
                        onClick={handleQuickAction}
                    >
                        {' '}
                        Thay đổi
                    </span>
                </span>,
            )
        }

        return jsx
    }

    return (
        <div className={`${className}`} ref={messageIndex === 0 ? ref : null}>
            <p className={`text-center text-xs text-systemMessageLight dark:text-systemMessageDark`}>
                {handleReplaceJson(message.content || '')}
            </p>
        </div>
    )
}

export default forwardRef(SystemMessage)
