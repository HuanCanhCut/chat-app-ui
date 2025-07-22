import React from 'react'
import { Emoji } from 'emoji-picker-react'
import { EmojiStyle } from 'emoji-picker-react'
import emojiRegex from 'emoji-regex'

import LinkHighlight from '../LinkHighlight'

interface EmojiMessageStyleProps {
    text: string
    type?: EmojiStyle
    size?: number
    className?: string
    textClassName?: string
    showLink?: boolean
}

const EmojiMessageStyle: React.FC<EmojiMessageStyleProps> = ({
    text,
    type = EmojiStyle.FACEBOOK,
    size = 16,
    className = '',
    textClassName = '',
    showLink = false,
}) => {
    const highlight = (text: string) => {
        const jsx: (string | JSX.Element)[] = []

        const regex = emojiRegex()
        let lastIndex = 0

        for (const match of text.matchAll(regex)) {
            const emoji = match[0]
            const matchIndex = match.index || 0

            jsx.push(<span key={`text-${matchIndex}`}>{text.slice(lastIndex, matchIndex)}</span>)

            const codePoint = emoji.codePointAt(0)
            const unified = codePoint?.toString(16).toUpperCase()

            if (unified) {
                jsx.push(
                    <span key={`emoji-container-${matchIndex}`} className={className}>
                        <Emoji
                            key={`emoji-${matchIndex}`}
                            unified={`${unified.toLowerCase()}`}
                            size={size}
                            emojiStyle={type}
                        />
                    </span>,
                )
            }

            lastIndex = matchIndex + emoji.length
        }

        // Thêm phần văn bản còn lại
        jsx.push(
            <span key={`text-end`} className={textClassName}>
                {text.slice(lastIndex)}
            </span>,
        )

        return jsx
    }

    return (
        <p className="flex w-fit items-center">
            {showLink ? <LinkHighlight className="underline">{highlight(text)}</LinkHighlight> : highlight(text)}
        </p>
    )
}

export default EmojiMessageStyle
