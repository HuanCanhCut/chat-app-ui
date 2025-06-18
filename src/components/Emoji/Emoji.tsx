'use client'

import { Categories, EmojiClickData, EmojiStyle } from 'emoji-picker-react'
import { Theme } from 'emoji-picker-react'

import Picker from '~/helpers/picker'

import './Emoji.css'
import { getCurrentTheme } from '~/redux/selector'
import { useAppSelector } from '~/redux'

interface EmojiProps {
    placeholder?: string
    // eslint-disable-next-line no-unused-vars
    onEmojiClick: (emojiData: EmojiClickData, event: MouseEvent) => void
    isReaction?: boolean
    isOpen?: boolean
}

const Emoji: React.FC<EmojiProps> = ({
    onEmojiClick,
    placeholder = 'Tìm kiếm biểu tượng cảm xúc',
    isReaction = false,
    isOpen = false,
}) => {
    const theme = useAppSelector(getCurrentTheme)

    const category = [
        {
            category: Categories.SMILEYS_PEOPLE,
            name: 'Mặt cười & hình người',
        },
        {
            category: Categories.ANIMALS_NATURE,
            name: 'Động vật & thiên nhiên',
        },
        {
            category: Categories.FOOD_DRINK,
            name: 'Thực phẩm & đồ uống',
        },
        {
            category: Categories.TRAVEL_PLACES,
            name: 'Địa điểm & du lịch',
        },
        {
            category: Categories.ACTIVITIES,
            name: 'Hoạt động & sự kiện',
        },
        {
            category: Categories.OBJECTS,
            name: 'Đồ vật & đồ dùng',
        },
        {
            category: Categories.SYMBOLS,
            name: 'Ký hiệu & dấu câu',
        },
        {
            category: Categories.FLAGS,
            name: 'Các quốc gia & dấu hiệu',
        },
    ]

    return (
        <div tabIndex={-1}>
            <Picker
                open={isOpen}
                theme={theme === 'light' ? Theme.LIGHT : Theme.DARK}
                emojiStyle={EmojiStyle.NATIVE}
                onEmojiClick={onEmojiClick}
                searchPlaceHolder={placeholder}
                skinTonesDisabled
                previewConfig={{ showPreview: false }} // hide footer preview
                categories={category}
                height={350}
                width={Math.min(380, Number(window.innerWidth - 40))}
                lazyLoadEmojis
                reactionsDefaultOpen={isReaction}
            />
        </div>
    )
}

export default Emoji
