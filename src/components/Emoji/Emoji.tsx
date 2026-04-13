'use client'

import { memo } from 'react'
import { Categories, EmojiStyle, PickerProps } from 'emoji-picker-react'
import { Theme } from 'emoji-picker-react'

import './Emoji.css'
import Picker from '~/helpers/picker'
import { selectTheme } from '~/redux/selector'
import { useAppSelector } from '~/redux/types'

interface EmojiProps extends Omit<PickerProps, 'isReaction' | 'isOpen' | 'className'> {
    placeholder?: string
    isReaction?: boolean
    isOpen?: boolean
    className?: string
}

const Emoji: React.FC<EmojiProps> = ({
    placeholder = 'Tìm kiếm biểu tượng cảm xúc',
    isReaction = false,
    isOpen = false,
    className = '',
    ...passProps
}) => {
    const theme = useAppSelector(selectTheme)

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
        <div tabIndex={-1} className="relative [z-index:999999999]">
            <Picker
                className={`bg-transparent ${className}`}
                open={isOpen}
                theme={theme === 'light' ? Theme.LIGHT : Theme.DARK}
                emojiStyle={EmojiStyle.FACEBOOK}
                searchPlaceHolder={placeholder}
                skinTonesDisabled
                previewConfig={{ showPreview: false }} // hide footer preview
                categories={category}
                height={350}
                width={Math.min(380, Number(window.innerWidth - 40))}
                lazyLoadEmojis
                reactionsDefaultOpen={isReaction}
                {...passProps}
            />
        </div>
    )
}

export default memo(Emoji)
