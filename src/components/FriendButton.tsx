import Button from './Button'

interface FriendButtonProps {
    isFriend: boolean
}

const FriendButton = ({ isFriend }: FriendButtonProps) => {
    return <Button>{isFriend ? 'Unfriend' : 'Add Friend'}</Button>
}

export default FriendButton
