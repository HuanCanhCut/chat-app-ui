import { memo } from 'react'

import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import UserAvatar from '~/components/UserAvatar/UserAvatar'
import { ConversationThemeModel } from '~/type/type'

interface ThemeItemProps {
    className?: string
    theme: ConversationThemeModel
    onClick?: () => void
    checked?: boolean
    active?: boolean
}

const ThemeItem: React.FC<ThemeItemProps> = ({
    className = '',
    theme,
    onClick = () => {},
    checked = false,
    active = false,
}) => {
    return (
        <div
            className={`flex w-full max-w-full cursor-pointer items-center overflow-hidden rounded-lg p-2 select-none ${active ? 'bg-primary/10' : ''} ${className}`}
            onClick={onClick}
        >
            <UserAvatar size={40} src={theme.logo} />
            <div className="ml-3 max-w-full overflow-hidden">
                <h4 className="truncate text-base font-medium">{theme.name}</h4>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">{theme.description}</p>
            </div>
            {checked && (
                <FontAwesomeIcon icon={faCheck} size="lg" className="text-primary ml-auto dark:text-[#5AA7FF]" />
            )}
        </div>
    )
}

export default memo(ThemeItem)
