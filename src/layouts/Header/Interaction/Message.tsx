import { useEffect } from 'react'
import Link from 'next/link'
import Tippy from 'huanpenguin-tippy-react'
import useSWR from 'swr'

import { MessageIcon } from '~/components/Icons'
import { Button } from '~/components/ui/button'
import config from '~/config'
import SWRKey from '~/enum/SWRKey'
import socket from '~/helpers/socket'
import { selectCurrentUser } from '~/redux/selector'
import { useAppSelector } from '~/redux/types'
import * as messageService from '~/services/messageService'
import { SocketMessage } from '~/type/type'

const Message = () => {
    const currentUser = useAppSelector(selectCurrentUser)

    const { data: unseenCount, mutate } = useSWR(SWRKey.GET_UNSEEN_COUNT, async () => {
        const response = await messageService.getUnseenCount()

        return response?.count
    })

    useEffect(() => {
        const socketHandler = (data: SocketMessage) => {
            if (data.conversation.last_message.sender_id !== currentUser?.data?.id) {
                const currentPath = window.location.pathname

                if (!currentPath.startsWith(config.routes.message)) {
                    mutate()
                }
            }
        }

        socket.on('NEW_MESSAGE', socketHandler)

        return () => {
            socket.off('NEW_MESSAGE', socketHandler)
        }
    }, [currentUser?.data?.id, mutate, unseenCount])

    return (
        <Tippy content="Messenger">
            <div className="relative">
                <Link href={config.routes.message}>
                    <Button size="icon" variant="ghost" className="size-10 rounded-full">
                        <MessageIcon className="size-5" />

                        {unseenCount !== undefined && unseenCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                {unseenCount}
                            </span>
                        )}
                    </Button>
                </Link>
            </div>
        </Tippy>
    )
}

export default Message
