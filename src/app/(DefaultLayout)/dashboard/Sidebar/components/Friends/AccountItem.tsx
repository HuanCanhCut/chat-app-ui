import UserAvatar from '~/components/UserAvatar'
import { UserModel } from '~/type/type'

interface Props {
    user: UserModel
    className?: string
}

const AccountItem: React.FC<Props> = ({ user, className = '' }) => {
    return (
        <div className={`flex items-center py-2 ${className}`}>
            <UserAvatar src={user.avatar} size={56} />
            <div className="ml-2">{user.full_name}</div>
        </div>
    )
}

export default AccountItem
