'use client'

import React from 'react'
import useSWR from 'swr'

import SWRKey from '~/enum/SWRKey'
import * as conversationService from '~/services/conversationService'
import ConversationItem from './ConversationItem'
import useThemeStore from '~/zustand/useThemeStore'
import Image from 'next/image'

const Friends = () => {
    const { theme } = useThemeStore()
    const { data: conversations } = useSWR(SWRKey.GET_CONVERSATIONS, () => {
        return conversationService.getConversations({ page: 1 })
    })

    return (
        <div className="mt-4 h-full w-full">
            {conversations && conversations.data.length > 0 ? (
                conversations.data.map((conversation, index) => {
                    return <ConversationItem key={index} conversation={conversation} />
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
