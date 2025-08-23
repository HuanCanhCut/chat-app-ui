import React, { useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

import { faCheck, faPencil } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from '~/components/Button'
import UserAvatar from '~/components/UserAvatar'
import SWRKey from '~/enum/SWRKey'
import handleApiError from '~/helpers/handleApiError'
import useClickOutside from '~/hooks/useClickOutside'
import * as conversationServices from '~/services/conversationService'
import { ConversationMember } from '~/type/type'

const ChangeNicknameModal: React.FC = () => {
    const { uuid } = useParams()

    const { data: conversation } = useSWR(uuid ? [SWRKey.GET_CONVERSATION_BY_UUID, uuid] : null, () => {
        return conversationServices.getConversationByUuid({ uuid: uuid as string })
    })

    const inputRef = useRef<HTMLInputElement>(null)

    const [nickname, setNickname] = useState<string>('')
    const [currentChange, setCurrentChange] = useState<ConversationMember | null>(null)

    const handleClick = (member: ConversationMember) => {
        if (currentChange && currentChange.id === member.id) return

        setCurrentChange(member)
        setNickname(member.nickname || '')
    }

    useClickOutside(inputRef, (e: MouseEvent | TouchEvent) => {
        const isClickInsideAbc = (e.target as HTMLElement).closest('#rename-account-container')

        if (isClickInsideAbc) return

        setCurrentChange(null)
        setNickname('')
    })

    const handleChangeNickname = async (e: React.MouseEvent<HTMLButtonElement>) => {
        try {
            if (nickname === currentChange?.nickname) return

            await conversationServices.changeConversationMemberNickname({
                uuid: uuid as string,
                userId: currentChange?.user.id || 0,
                nickname,
            })

            setCurrentChange(null)
            setNickname('')
        } catch (error: any) {
            handleApiError(error)
        }
    }

    return (
        <main className="flex w-[550px] max-w-full flex-col gap-7 px-5 py-8 [overflow-y:overlay]">
            {conversation?.data.members.map((member, index) => {
                return (
                    <div
                        key={index}
                        id="rename-account-container"
                        className="flex items-center justify-between"
                        onClick={() => handleClick(member)}
                    >
                        <div className="flex flex-1 cursor-pointer">
                            <UserAvatar size={50} src={member.user.avatar} />

                            <div className="ml-3 flex w-full flex-col justify-center gap-1 [&_*]:text-gray-900 [&_*]:dark:text-gray-200">
                                {member.id === currentChange?.id ? (
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder={member.nickname || 'Đặt biệt danh'}
                                        className="w-full rounded-lg border border-gray-300 bg-transparent p-2 dark:border-zinc-700 dark:bg-transparent"
                                        onChange={(e) => setNickname(e.target.value)}
                                        value={nickname}
                                    />
                                ) : (
                                    <>
                                        <h4 className="truncate text-base font-medium">{member.user.full_name}</h4>
                                        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                            {member.nickname || 'Đặt biệt danh'}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        {member.id === currentChange?.id ? (
                            <Button
                                buttonType="icon"
                                className="ml-3 bg-transparent dark:bg-transparent"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.stopPropagation()
                                    handleChangeNickname(e)
                                }}
                            >
                                <FontAwesomeIcon icon={faCheck} width={20} height={20} />
                            </Button>
                        ) : (
                            <Button buttonType="icon" className="ml-3 bg-transparent dark:bg-transparent">
                                <FontAwesomeIcon icon={faPencil} width={20} height={20} />
                            </Button>
                        )}
                    </div>
                )
            })}
        </main>
    )
}

export default ChangeNicknameModal
