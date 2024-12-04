'use client'

import React from 'react'
import useSWR from 'swr'

import SWRKey from '~/enum/SWRKey'
import * as conversationService from '~/services/conversationService'
import ConversationItem from './ConversationItem'
import useThemeStore from '~/zustand/useThemeStore'
import Image from 'next/image'
import Skeleton from 'react-loading-skeleton'

const Friends = () => {
    const { theme } = useThemeStore()
    const { data: conversations, isLoading } = useSWR(SWRKey.GET_CONVERSATIONS, async () => {
        const response = await conversationService.getConversations({ page: 1 })
        const groupConversationsByUuid = response?.data?.reduce<Record<string, any>>((acc, conversation) => {
            acc[conversation.uuid] = conversation
            return acc
        }, {})
        return groupConversationsByUuid
    })

    const Loading = () => {
        return (
            <>
                <div className="mt-4 flex items-center gap-2">
                    <Skeleton width={56} height={56} circle />
                    <div>
                        <Skeleton width={200} height={20} />
                        <Skeleton width={160} height={20} />
                    </div>
                </div>
            </>
        )
    }

    return (
        <div className="h-full w-full pt-4">
            {isLoading ? (
                [1, 2, 3, 4, 5, 6, 7].map((_, index) => {
                    return <Loading key={index} />
                })
            ) : conversations && Object.keys(conversations).length > 0 ? (
                Object.keys(conversations).map((uuid) => {
                    return (
                        <div key={uuid} className="pr-2">
                            <ConversationItem conversation={conversations[uuid]} />
                        </div>
                    )
                })
            ) : (
                <div className="flex h-full flex-col items-center justify-center">
                    <Image
                        src={
                            theme === 'dark'
                                ? '/static/media/empty-message-light.png'
                                : '/static/media/empty-message-dark.png'
                        }
                        alt="empty-conversation"
                        width={100}
                        height={100}
                    />
                    <h2>Không có tin nhắn nào</h2>
                    <p className="mt-2 text-sm text-gray-500">Tin nhắn mới sẽ hiển thị ở đây</p>
                </div>
            )}
        </div>
    )
}

export default Friends
