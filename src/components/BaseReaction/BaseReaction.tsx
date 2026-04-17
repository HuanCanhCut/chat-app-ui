import { JSXElementConstructor, ReactElement, useRef } from 'react'
import { motion } from 'framer-motion'
import { Instance, Props } from 'tippy.js'

import CustomTippy from '../CustomTippy'
import baseReactionIcon from '~/common/baseReactionIcon'
import { BaseReactionUnified } from '~/type/reaction.type'

const iconMapping = baseReactionIcon(36)

interface BaseReactionProps {
    handleReaction: (unified?: BaseReactionUnified | undefined) => Promise<void>
    children: ReactElement<unknown, string | JSXElementConstructor<any>>
    className?: string
}

const BaseReaction = ({ handleReaction, children, className = '' }: BaseReactionProps) => {
    const reactionTippyRef = useRef<Instance<Props> | null>(null)

    const renderReaction = () => {
        return (
            <div className="flex items-center gap-1.5 rounded-full bg-white p-1 dark:bg-[#27292a]">
                {(() => {
                    return Object.keys(iconMapping).map((key, index) => {
                        const unified = key as keyof typeof iconMapping

                        const icon = iconMapping[unified]
                        return (
                            <motion.button
                                key={key}
                                whileHover={{ scale: 1.2 }}
                                initial={{ y: 20, opacity: 0 }}
                                transition={{ duration: 0.1, delay: index * 0.02 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                onClick={() => {
                                    handleReaction(unified)
                                    // await while hover reaction tippy reset
                                    setTimeout(() => {
                                        reactionTippyRef.current?.hide()
                                    }, 100)
                                }}
                            >
                                {icon}
                            </motion.button>
                        )
                    })
                })()}
            </div>
        )
    }

    return (
        <CustomTippy
            trigger="mouseenter"
            renderItem={renderReaction}
            timeDelayOpen={400}
            timeDelayClose={500}
            placement="top-start"
            className={className}
            offsetY={10}
            initialScale={0.95}
            onShow={(instance) => {
                reactionTippyRef.current = instance
            }}
        >
            {children}
        </CustomTippy>
    )
}

export default BaseReaction
