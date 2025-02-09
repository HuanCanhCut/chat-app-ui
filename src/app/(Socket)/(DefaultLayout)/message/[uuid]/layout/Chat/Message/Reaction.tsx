import Tippy from '@tippyjs/react'
import { MessageModel } from '~/type/type'

interface ReactionProps {
    message: MessageModel
    handleOpenReactionModal: (messageId: number) => void
}

const Reaction = ({ message, handleOpenReactionModal }: ReactionProps) => {
    return message.top_reactions?.length !== 0 ? (
        <Tippy
            content={
                <div>
                    {message?.top_reactions?.map((reaction, index) => {
                        return (
                            <p className="font-light leading-5" key={index}>
                                {reaction.user_reaction.full_name}
                            </p>
                        )
                    })}

                    {message?.total_reactions > 2 && (
                        <p className="font-light leading-5">và {message?.total_reactions - 2} người khác...</p>
                    )}
                </div>
            }
        >
            <div
                className="absolute bottom-[-10px] right-1 flex cursor-pointer items-center rounded-full bg-white py-[2px] shadow-sm shadow-zinc-300 dark:bg-zinc-800 dark:shadow-zinc-700"
                onClick={() => {
                    handleOpenReactionModal(message.id)
                }}
            >
                {message?.top_reactions?.map((reaction, index) => {
                    return (
                        <span className="text-sm leading-none" key={index}>
                            {reaction.react}
                        </span>
                    )
                })}
                {message?.total_reactions !== 0 && (
                    <span className="mx-1 text-xs leading-none text-gray-500 dark:text-zinc-400">
                        {message?.total_reactions}
                    </span>
                )}
            </div>
        </Tippy>
    ) : null
}

export default Reaction
