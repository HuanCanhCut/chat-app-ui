import Linkify from 'react-linkify'

interface LinkifyProps {
    children: React.ReactNode
    className?: string
}

const LinkHighlight = ({ children, className }: LinkifyProps) => {
    // Custom component decorator to ensure links open in a new tab
    const componentDecorator = (href: string, text: string, key: number) => {
        return (
            <a
                href={href}
                key={key}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-medium underline ${className}`}
            >
                {text}
            </a>
        )
    }

    return <Linkify componentDecorator={componentDecorator}>{children}</Linkify>
}

export default LinkHighlight
