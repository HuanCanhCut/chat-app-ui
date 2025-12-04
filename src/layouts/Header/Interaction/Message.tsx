import { useEffect } from 'react'
import useSWR from 'swr'

import Tippy from '~/vendor/tippy'
import Button from '~/components/Button'
import { MessageIcon } from '~/components/Icons'
import config from '~/config'
import { SocketEvent } from '~/enum/SocketEvent'
import SWRKey from '~/enum/SWRKey'
import socket from '~/helpers/socket'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import * as messageService from '~/services/messageService'
import { SocketMessage } from '~/type/type'

const Message = () => {
    const currentUser = useAppSelector(getCurrentUser)

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

        socket.on(SocketEvent.NEW_MESSAGE, socketHandler)

        return () => {
            socket.off(SocketEvent.NEW_MESSAGE, socketHandler)
        }
    }, [currentUser?.data?.id, mutate, unseenCount])

    return (
        <Tippy content="Messenger">
            <div className="relative">
                <Button buttonType="icon" href={config.routes.message}>
                    <MessageIcon />

                    {unseenCount !== undefined && unseenCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                            {unseenCount}
                        </span>
                    )}
                </Button>
            </div>
        </Tippy>
    )
}

export default Message
