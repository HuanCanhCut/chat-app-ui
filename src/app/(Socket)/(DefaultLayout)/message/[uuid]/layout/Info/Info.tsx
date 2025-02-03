interface InfoProps {
    className?: string
}

const Info: React.FC<InfoProps> = ({ className = '' }) => {
    return (
        <div
            className={`${className} min-h-[calc(100vh-var(--header-mobile-height))] border-l border-gray-200 dark:border-gray-800 sm:min-h-[calc(100vh-var(--header-height))]`}
        >
            Info
        </div>
    )
}

export default Info
