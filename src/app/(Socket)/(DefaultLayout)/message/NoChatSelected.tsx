'use client'

import Image from 'next/image'

import { selectTheme } from '~/redux/selector'
import { useAppSelector } from '~/redux/types'

const NoChatSelected = () => {
    const theme = useAppSelector(selectTheme)
    return (
        <div className="[overflow: overlay] h-full max-h-[calc(100dvh-var(--header-height-mobile))] sm:max-h-[calc(100dvh-var(--header-height))]">
            <div className="flex h-full flex-col items-center justify-center">
                <Image
                    src={
                        theme === 'dark'
                            ? '/static/media/no-chat-selected-light.png'
                            : '/static/media/no-chat-selected-dark.png'
                    }
                    alt="no-chat-selected"
                    width={200}
                    height={200}
                    priority
                />
                <h2>Chưa có đoạn chat nào được chọn</h2>
            </div>
        </div>
    )
}

export default NoChatSelected
