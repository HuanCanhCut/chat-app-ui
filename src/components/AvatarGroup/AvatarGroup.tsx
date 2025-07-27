import UserAvatar from '../UserAvatar'

interface AvatarGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'translate'> {
    avatars: string[]
    size?: number
    translate?: number
    className?: string
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({ avatars, size = 36, translate = 0, className = '', ...props }) => {
    return (
        <div className={`relative ${className}`} {...props}>
            {avatars.map((avatar, index) => (
                <div key={avatar} className={`absolute right-${index * translate}`}>
                    <UserAvatar src={avatar} size={size} />
                </div>
            ))}
        </div>
    )
}

export default AvatarGroup
