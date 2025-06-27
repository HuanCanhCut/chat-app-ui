import { memo, useEffect, useState } from 'react'
import { motion,useSpring } from 'framer-motion'

import Tippy from '@tippyjs/react/headless'
import { sendEvent } from '~/helpers/events'

interface CustomTippyProps {
    children: React.ReactElement
    trigger?: 'click' | 'focus' | 'manual' | 'mouseenter' | 'focusin'
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
    handleHide?: () => void
    // eslint-disable-next-line no-unused-vars
    onShow?: (instance: any) => void
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
    onShow,
}: CustomTippyProps) {
    const springConfig: any = { damping: 15, stiffness: 300 }
    const initialScale = 0.5
    const opacity = useSpring(0, springConfig)
    const scale = useSpring(initialScale, springConfig)
    const [appendToElement, setAppendToElement] = useState<HTMLElement | null>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setAppendToElement(document.body)
        }
    }, [])

    const render = (attrs: any) => (
        <motion.div style={{ scale, opacity }}>
            <div {...attrs}>{renderItem()}</div>
        </motion.div>
    )

    const onMount = () => {
        scale.set(1)
        opacity.set(1)
    }

    const onHide = ({ unmount }: { unmount: any }) => {
        const cleanup = scale.on('change', (value) => {
            if (value <= initialScale) {
                cleanup()
                unmount()
            }
        })

        scale.set(initialScale)
        opacity.set(0)

        sendEvent({ eventName: 'tippy:tippy-hidden', detail: true })
    }

    return (
        <div>
            {appendToElement && (
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
                    onShow={onShow}
                    appendTo={appendToElement}
                >
                    {children}
                </Tippy>
            )}
        </div>
    )
})
