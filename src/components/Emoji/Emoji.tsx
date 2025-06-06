'use client'

import { Categories, EmojiClickData, EmojiStyle } from 'emoji-picker-react'
import { Theme } from 'emoji-picker-react'
import HeadlessTippy from '@tippyjs/react/headless'

import Picker from '~/helpers/picker'

import './Emoji.css'
import { getCurrentTheme } from '~/redux/selector'
import { useAppSelector } from '~/redux'

interface EmojiProps {
    children: React.ReactElement
    isOpen: boolean
    placement?:
        | 'bottom-start'
        | 'bottom-end'
        | 'top-start'
        | 'top-end'
        | 'left-start'
        | 'left-end'
        | 'right-start'
        | 'right-end'
    // eslint-disable-next-line no-unused-vars
    setIsOpen: (value: boolean) => void
    placeholder?: string
    // eslint-disable-next-line no-unused-vars
    onEmojiClick: (emojiData: EmojiClickData, event: MouseEvent) => void
    isReaction?: boolean
}

const Emoji: React.FC<EmojiProps> = ({
    children,
    isOpen = false,
    placement = 'top-start',
    setIsOpen,
    onEmojiClick,
    placeholder = 'Tìm kiếm biểu tượng cảm xúc',
    isReaction = false,
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

    const renderItem = (attrs: any) => {
        return (
            <div {...attrs} tabIndex="-1">
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

    return (
        <HeadlessTippy
            render={renderItem}
            onClickOutside={() => setIsOpen(false)}
            placement={placement}
            offset={[0, 15]}
            interactive
            visible={isOpen}
        >
            {children}
        </HeadlessTippy>
    )
}

export default Emoji
