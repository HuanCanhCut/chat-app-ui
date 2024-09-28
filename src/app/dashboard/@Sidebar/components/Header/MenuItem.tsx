import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import SwitchButton from '~/components/SwitchButton'
import { useState } from 'react'
import Button from '~/components/Button'

interface MenuItemProps {
    icon: IconDefinition
    label: string
    line?: boolean
    switchButton?: boolean
}

export default function MenuItem({ item }: { item: MenuItemProps }) {
    const [isOn, setIsOn] = useState(localStorage.getItem('theme') === 'dark')

    const handleSwitch = () => {
        setIsOn(!isOn)
        localStorage.setItem('theme', isOn ? 'light' : 'dark')
        document.documentElement.classList.toggle('dark')
    }

    return (
        <button
            className={`flex w-full items-center justify-between gap-2 py-2 ${item.line ? 'border-t border-gray-300 dark:border-gray-700' : ''}`}
        >
            <div className="flex items-center gap-2">
                {/* <div className="flex h-9 w-9 items-center justify-center gap-2 rounded-full bg-gray-100">
                    <FontAwesomeIcon icon={item.icon} className="text-xl" />
                </div> */}
                <Button buttonType="icon">
                    <FontAwesomeIcon icon={item.icon} className="text-xl" />
                </Button>
                <span className="font-medium">{item.label}</span>
            </div>

            {item.switchButton && <SwitchButton onClick={handleSwitch} isOn={isOn} />}
        </button>
    )
}
