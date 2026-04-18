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

export const reactionNameMapping: Record<
    keyof typeof iconMapping,
    { name: string; type: 'like' | 'support' | 'heart' | 'haha' | 'wow' | 'sad' | 'angry' }
> = {
    '1f44d': {
        name: 'Thích',
        type: 'like',
    },
    '1f970': {
        name: 'Thương thương',
        type: 'support',
    },
    '2764-fe0f': {
        name: 'Yêu thích',
        type: 'heart',
    },
    '1f602': {
        name: 'Haha',
        type: 'haha',
    },
    '1f62e': {
        name: 'Wow',
        type: 'wow',
    },
    '1f622': {
        name: 'Buồn',
        type: 'sad',
    },
    '1f621': {
        name: 'Phẫn nộ',
        type: 'angry',
    },
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
                                whileInView={{
                                    y: 0,
                                    opacity: 1,
                                    transition: {
                                        duration: 0.1,
                                        delay: index * 0.02,
                                    },
                                }}
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
