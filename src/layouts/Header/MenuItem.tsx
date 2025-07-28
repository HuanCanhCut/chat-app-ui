import { MenuItemType } from './Interaction/Interaction'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from '~/components/Button/Button'
import SwitchButton from '~/components/SwitchButton/SwitchButton'

interface MenuItemProps {
    item: MenuItemType
    onChoose: (type: MenuItemType['type']) => void
    onToggleSwitch: (type: MenuItemType['type']) => void
}

const MenuItem = ({ item, onChoose, onToggleSwitch }: MenuItemProps) => {
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
                <span className="text-base font-medium">{item.label}</span>
            </div>

            {item.switchButton && (
                <SwitchButton
                    onClick={() => {
                        onToggleSwitch(item.type)
                    }}
                    isOn={item.isOn}
                />
            )}
        </div>
    )
}

export default MenuItem
