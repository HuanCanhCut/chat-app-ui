import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { faArrowLeft, faMagnifyingGlass, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import config from '~/config'

import * as conversationServices from '~/services/conversationService'
import Button from '~/components/Button'
import { listenEvent, sendEvent } from '~/helpers/events'
import SWRKey from '~/enum/SWRKey'
import UserAvatar from '~/components/UserAvatar'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import { ConversationMember } from '~/type/type'
import Link from 'next/link'
import { momentTimezone } from '~/utils/moment'

interface ControlPanelProps {
    setSearchMode: Dispatch<SetStateAction<boolean>>
}

const ControlPanel: React.FC<ControlPanelProps> = ({ setSearchMode }) => {
    const currentUser = useAppSelector(getCurrentUser)
    const { uuid } = useParams()

    const { data: conversation } = useSWR(uuid ? [SWRKey.GET_CONVERSATION_BY_UUID, uuid] : null, () => {
        return conversationServices.getConversationByUuid({ uuid: uuid as string })
    })

    const member = conversation?.data.conversation_members.find((member) => {
        return member.user_id !== currentUser?.data.id
    }) as ConversationMember

    const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(member.user.last_online_at)

    const handleToggleInfo = useCallback(() => {
        sendEvent({
            eventName: 'info:toggle',
            detail: {
                isOpen: false,
            },
        })
    }, [])

    useEffect(() => {
        interface UserStatus {
            user_id: number
            is_online: boolean
            last_online_at: Date
        }

        const remove = listenEvent<UserStatus>({
            eventName: 'user:status',
            handler: ({ detail }) => {
                if (detail.user_id === member.user.id) {
                    setLastOnlineTime(detail.last_online_at)
                }
            },
        })

        return remove
    }, [member.user.id])

    return (
        <>
            <Button
                buttonType="icon"
                className="block bg-transparent dark:bg-transparent sm:hidden"
                onClick={handleToggleInfo}
            >
                <FontAwesomeIcon icon={faArrowLeft} />
            </Button>

            <div className="flex flex-col items-center pt-2">
                <UserAvatar
                    size={80}
                    src={conversation?.data.is_group ? conversation?.data.avatar : member.user.avatar}
                    isOnline={member.user.is_online}
                    onlineClassName="h-4 w-4 right-1"
                />

                <Link href={`${config.routes.user}/@${member.user.nickname}`} className="mt-2 hover:underline">
                    <p className="line-clamp-2 w-full text-ellipsis text-center font-medium">
                        {conversation?.data.is_group
                            ? conversation.data.name
                            : member.nickname || member.user.full_name}
                    </p>
                </Link>

                {!conversation?.data.is_group && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {member.user.is_online
                            ? 'Đang hoạt động'
                            : `${lastOnlineTime ? `Hoạt động ${momentTimezone(lastOnlineTime)} trước` : ''}`}
                    </p>
                )}

                <div className="flex-center mt-4 gap-8">
                    <div className="flex flex-col items-center">
                        <Link href={`${config.routes.user}/@${member.user.nickname}`}>
                            <Button buttonType="icon" className="h-8 w-8">
                                <FontAwesomeIcon icon={faUser} />
                            </Button>
                        </Link>
                        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">Trang cá nhân</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <Button buttonType="icon" className="h-8 w-8" onClick={() => setSearchMode(true)}>
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </Button>
                        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">Tìm kiếm</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ControlPanel
