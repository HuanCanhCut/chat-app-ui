import { UserModel } from '~/type/type'
import PopperWrapper from './PopperWrapper'
import UserAvatar from './UserAvatar'
import Button from './Button'
import { MessageIcon } from './Icons'
import FriendButton from './FriendButton'

interface AccountPreviewProps {
    user: UserModel
    currentUser: UserModel
}

const AccountPreview = ({ user, currentUser }: AccountPreviewProps) => {
    return (
        <PopperWrapper className="w-[400px] max-w-[400px] p-4">
            <div className="w-full">
                <div className="flex items-start gap-4">
                    <UserAvatar src={user.avatar} size={96} />
                    <main className="mt-2 flex flex-col gap-1">
                        <h2 className="font-semibold">{user.full_name}</h2>
                        <h4 className="text-sm">{user.nickname}</h4>
                    </main>
                </div>
                {currentUser.id !== user.id && (
                    <div className="mt-4 flex items-center gap-2">
                        <FriendButton user={user} className="flex-1" />
                        <Button buttonType="primary" className="flex-1" leftIcon={<MessageIcon />}>
                            Nhắn tin
                        </Button>
                    </div>
                )}
            </div>
        </PopperWrapper>
    )
}

export default AccountPreview
