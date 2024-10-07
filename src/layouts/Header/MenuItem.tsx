import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import SwitchButton from '~/components/SwitchButton'
import { useState } from 'react'
import Button from '~/components/Button'
import useThemeStore from '~/zustand/useThemeStore'

interface MenuItemProps {
    icon: IconDefinition
    label: string
    line?: boolean
    switchButton?: boolean
}

export default function MenuItem({ item }: { item: MenuItemProps }) {
    const { theme, setTheme } = useThemeStore()
    const [isOn, setIsOn] = useState(theme === 'dark')

    const handleSwitch = () => {
        setIsOn(!isOn)
        setTheme(isOn ? 'light' : 'dark')
        document.documentElement.classList.toggle('dark')
    }

    return (
        <div
            className={`flex w-full cursor-pointer items-center justify-between gap-2 px-5 py-2 hover:bg-gray-100 dark:hover:bg-[#2d2d2f] ${item.line ? 'border-t border-gray-300 dark:border-gray-700' : ''}`}
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
