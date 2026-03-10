import { motion } from 'framer-motion'

type Props = {
    isOn?: boolean
    onClick: () => void
    className?: string
}

function SwitchButton({ isOn = true, onClick, className }: Props) {
    const spring = {
        type: 'spring',
        stiffness: 700,
        damping: 30,
    }

    return (
        <span
            className={`m-px flex h-6 w-11 cursor-pointer items-center rounded-[100px] px-[3px] hover:opacity-90 ${
                isOn ? 'bg-[#0be09b]' : 'bg-[#fe2c55]'
            } ${className}`}
            onClick={onClick}
        >
            <motion.span
                className="fl ex-shrink-0 h-[19px] w-[19px] rounded-full bg-white shadow-xs"
                animate={{ x: isOn ? 19 : 0 }}
                transition={spring}
            />
        </span>
    )
}

export default SwitchButton
