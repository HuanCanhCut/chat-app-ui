import { motion } from 'framer-motion'

type Props = {
    isOn?: boolean
    onClick: () => void
    className?: any
}

function SwitchButton({ isOn = true, onClick, className, ...props }: Props) {
    const spring = {
        type: 'spring',
        stiffness: 700,
        damping: 30,
    }

    return (
        <span
            className={`m-px flex h-[24px] w-[44px] cursor-pointer items-center rounded-[100px] pl-[3.5px] pr-[2px] hover:opacity-90 ${className} ${
                isOn ? 'justify-end bg-[#0be09b]' : 'justify-start bg-[#fe2c55]'
            }`}
            onClick={onClick}
            {...props}
        >
            <motion.span
                className="h-[19px] w-[19px] rounded-full bg-white shadow-xs"
                layout
                transition={spring}
            ></motion.span>
        </span>
    )
}

export default SwitchButton
