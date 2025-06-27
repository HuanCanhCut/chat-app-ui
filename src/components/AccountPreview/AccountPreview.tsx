import Button from '~/components/Button/Button'
import FriendButton from '~/components/FriendButton'
import { MessageIcon } from '~/components/Icons/Icons'
import PopperWrapper from '~/components/PopperWrapper/PopperWrapper'
import UserAvatar from '~/components/UserAvatar/UserAvatar'
import { UserModel } from '~/type/type'

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
                        <h2 className="font-bold">{user.full_name}</h2>
                        <h4 className="text-sm">{user.nickname}</h4>
                    </main>
                </div>
                {currentUser.id !== user.id && (
                    <div className="mt-4 flex items-center gap-2">
                        <FriendButton user={user} className="flex-1" />
                        <Button
                            buttonType="primary"
                            className="flex-1"
                            leftIcon={<MessageIcon />}
                            href={`/message/${user?.conversation?.uuid}`}
                        >
                            Nhắn tin
                        </Button>
                    </div>
                )}
            </div>
        </PopperWrapper>
    )
}

export default AccountPreview
