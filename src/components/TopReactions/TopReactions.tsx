import { useState } from 'react'

import ReactionModal from '../ReactionModal'
import baseReactionIcon from '~/common/baseReactionIcon'
import { cn } from '~/lib/utils'
import { BaseReactionUnified, ReactionableType, ReactionModel } from '~/type/reaction.type'

interface TopReactionsProps {
    topReactions: (Pick<ReactionModel, 'reactionable_id'> & { react: BaseReactionUnified })[]
    reactionCount: number
    reactionableType: ReactionableType
    className?: string
}

const TopReactions = ({ topReactions, reactionCount, reactionableType, className = '' }: TopReactionsProps) => {
    const [openReactionModal, setOpenReactionModal] = useState<{ isOpen: boolean; reactionableId: number }>({
        isOpen: false,
        reactionableId: 0,
    })

    return (
        <>
            {openReactionModal.isOpen && (
                <ReactionModal
                    isOpen={openReactionModal.isOpen}
                    onClose={() => setOpenReactionModal({ isOpen: false, reactionableId: 0 })}
                    reactionableId={openReactionModal.reactionableId}
                    reactionableType={reactionableType}
                />
            )}

            {(topReactions?.length || 0) > 0 && (
                <div
                    className={cn('group flex cursor-pointer items-center', className)}
                    onClick={() =>
                        setOpenReactionModal({
                            isOpen: true,
                            reactionableId: topReactions[0].reactionable_id,
                        })
                    }
                >
                    {topReactions?.map((reaction, index) => {
                        const icon = baseReactionIcon(18)[reaction.react]

                        return (
                            <div
                                key={index}
                                className="flex items-center justify-center rounded-full border-2 border-white dark:border-[#27292a]"
                                style={{
                                    marginLeft: index === 0 ? 0 : '-4px',
                                    marginRight: index === topReactions!.length - 1 ? '-4px' : 0,
                                    zIndex: topReactions!.length - index,
                                }}
                            >
                                {icon}
                            </div>
                        )
                    })}

                    {reactionCount > 0 && (
                        <span className="text-muted-foreground mx-1.5 text-sm select-none group-hover:underline">
                            {reactionCount}
                        </span>
                    )}
                </div>
            )}
        </>
    )
}

export default TopReactions
