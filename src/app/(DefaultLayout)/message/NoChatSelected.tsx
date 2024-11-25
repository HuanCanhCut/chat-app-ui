'use client'

import Image from 'next/image'
import useThemeStore from '~/zustand/useThemeStore'

const NoChatSelected = () => {
    const { theme } = useThemeStore()
    return (
        <div className="[overflow: overlay] h-full max-h-[calc(100vh-var(--header-mobile-height))] sm:max-h-[calc(100vh-var(--header-height))]">
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
                />
                <h2>Chưa có đoạn chat nào được chọn</h2>
            </div>
        </div>
    )
}

export default NoChatSelected
