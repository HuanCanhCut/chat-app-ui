interface MessageProps {
    className?: string
}

const Message: React.FC<MessageProps> = ({ className = '' }) => {
    return <div className={`${className} [overflow-y:overlay]`}>Message</div>
}

export default Message
