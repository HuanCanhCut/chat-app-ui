import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserFriends, faUserPlus } from '@fortawesome/free-solid-svg-icons'

import { UserModel } from '~/type/type'
import Button from './Button'

interface FriendButtonProps {
    user: UserModel
    className?: string
}

const FriendButton = ({ user, className = '' }: FriendButtonProps) => {
    return (
        <Button
            buttonType={user.is_friend ? 'rounded' : 'primary'}
            leftIcon={user.is_friend ? <FontAwesomeIcon icon={faUserFriends} /> : <FontAwesomeIcon icon={faUserPlus} />}
            className={className}
        >
            {user.is_friend ? 'Bạn bè' : 'Thêm bạn bè'}
        </Button>
    )
}

export default FriendButton
