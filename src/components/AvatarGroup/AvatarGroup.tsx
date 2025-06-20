import UserAvatar from '../UserAvatar'

interface AvatarGroupProps {
    avatars: string[]
    size?: number
    translate?: number
    className?: string
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({ avatars, size = 36, translate = 0, className = '' }) => {
    return (
        <div className={`relative ${className}`}>
            {avatars.map((avatar, index) => (
                <UserAvatar key={avatar} src={avatar} size={size} className={`absolute right-${index * translate}`} />
            ))}
        </div>
    )
}

export default AvatarGroup
