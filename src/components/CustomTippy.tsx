import Tippy from '@tippyjs/react'
import { memo } from 'react'
import { useSpring, motion } from 'framer-motion'

interface CustomTippyProps {
    children: React.ReactElement
    render: any
    trigger?: 'click' | 'hover' | 'focus' | 'manual'
    renderItem: () => React.ReactElement
    placement?:
        | 'top'
        | 'bottom'
        | 'left'
        | 'right'
        | 'top-start'
        | 'top-end'
        | 'bottom-start'
        | 'bottom-end'
        | 'left-start'
        | 'left-end'
        | 'right-start'
        | 'right-end'
        | 'auto'
        | 'auto-start'
        | 'auto-end'
    offsetX?: number
    offsetY?: number
    hideOnClick?: boolean
    timeDelayOpen?: number
    timeDelayClose?: number
}

export default memo(function CustomTippy({
    children,
    renderItem,
    trigger = 'click',
    timeDelayOpen = 0,
    timeDelayClose = 0,
    placement = 'bottom-end',
    offsetX = 0,
    offsetY = 0,
    hideOnClick = true,
}: CustomTippyProps) {
    const springConfig: any = { damping: 15, stiffness: 300 }
    const initialScale = 0.5

    // Khởi tạo useSpring với giá trị khởi tạo cụ thể
    const opacity = useSpring(0, springConfig)
    const scale = useSpring(initialScale, springConfig)

    const render = (attrs: any) => {
        return (
            <motion.div style={{ scale, opacity }}>
                <div {...attrs}>{renderItem()}</div>
            </motion.div>
        )
    }

    const onMount = () => {
        scale.set(1)
        opacity.set(1)
    }

    const onHide = ({ unmount }: { unmount: any }) => {
        scale.on('change', (value) => {
            if (value <= initialScale) {
                unmount()
            }
        })

        scale.set(initialScale)
        opacity.set(0)
    }

    return (
        <Tippy
            trigger={trigger}
            animation={true}
            interactive
            delay={[timeDelayOpen, timeDelayClose]}
            offset={[offsetX, offsetY]}
            hideOnClick={hideOnClick}
            placement={placement}
            render={render}
            onMount={onMount}
            onHide={onHide}
        >
            {children}
        </Tippy>
    )
})
