import { Emoji } from 'emoji-picker-react'
import { EmojiStyle } from 'emoji-picker-react'
import emojiRegex from 'emoji-regex'

interface EmojiMessageStyleProps {
    text: string
    type?: EmojiStyle
    size?: number
    className?: string
}

const EmojiMessageStyle: React.FC<EmojiMessageStyleProps> = ({
    text,
    type = EmojiStyle.FACEBOOK,
    size = 16,
    className = '',
}) => {
    const highlight = (text: string) => {
        const jsx: (string | JSX.Element)[] = []

        const regex = emojiRegex()
        let lastIndex = 0

        for (const match of text.matchAll(regex)) {
            const emoji = match[0]
            const matchIndex = match.index || 0

            jsx.push(<span key={Math.random()}>{text.slice(lastIndex, matchIndex)}</span>)

            const codePoint = emoji.codePointAt(0)
            const unified = codePoint?.toString(16).toUpperCase()

            if (unified) {
                console.log(unified)

                jsx.push(
                    <span className={className}>
                        <Emoji key={Math.random()} unified={`${unified.toLowerCase()}`} size={size} emojiStyle={type} />
                    </span>,
                )
            }

            lastIndex = matchIndex + 2
        }

        // Thêm phần văn bản còn lại
        jsx.push(text.slice(lastIndex))

        return jsx
    }

    return (
        <p key={Math.random()} className="flex w-fit items-center">
            {highlight(text)}
        </p>
    )
}

export default EmojiMessageStyle
