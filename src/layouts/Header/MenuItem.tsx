import { useState } from 'react'

import { MenuItemType } from './Interaction/Interaction'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from '~/components/Button/Button'
import SwitchButton from '~/components/SwitchButton/SwitchButton'
import { actions, useAppDispatch, useAppSelector } from '~/redux'
import { getCurrentTheme } from '~/redux/selector'

interface MenuItemProps {
    item: MenuItemType
    // eslint-disable-next-line no-unused-vars
    onChoose: (type: MenuItemType['type']) => void
}

export default function MenuItem({ item, onChoose }: MenuItemProps) {
    const theme = useAppSelector(getCurrentTheme)
    const dispatch = useAppDispatch()

    const [isOn, setIsOn] = useState(theme === 'dark')

    const handleSwitch = () => {
        setIsOn(!isOn)
        dispatch(actions.setTheme(isOn ? 'light' : 'dark'))
        document.documentElement.classList.toggle('dark')
    }

    const handleChoose = () => {
        onChoose(item.type)
    }

    return (
        <div
            className={`flex w-full cursor-pointer items-center justify-between gap-2 px-5 py-2 hover:bg-gray-100 dark:hover:bg-[#2d2d2f] ${item.line ? 'border-t border-gray-300 dark:border-zinc-700' : ''}`}
            onClick={handleChoose}
        >
            <div className="flex items-center gap-2">
                <Button buttonType="icon">
                    <FontAwesomeIcon icon={item.icon} className="text-xl" />
                </Button>
                <span className="font-medium">{item.label}</span>
            </div>

            {item.switchButton && <SwitchButton onClick={handleSwitch} isOn={isOn} />}
        </div>
    )
}
