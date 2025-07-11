import { memo, useCallback, useState } from 'react'
import { toast } from 'react-toastify'
import { useParams } from 'next/navigation'
import { AxiosError } from 'axios'

import Button from '~/components/Button'
import handleApiError from '~/helpers/handleApiError'
import * as conversationService from '~/services/conversationService'

interface RenameConversationModalProps {
    onClose: () => void
    name?: string
}

const MAX_LENGTH = 500

const RenameConversationModal: React.FC<RenameConversationModalProps> = ({ onClose, name: initialName }) => {
    const { uuid } = useParams()

    const [name, setName] = useState(initialName || '')

    const handleRename = useCallback(async () => {
        if (name.trim().length === 0) {
            toast.error('Tên đoạn chat không được để trống')
            return
        }

        try {
            const response = await conversationService.renameConversation({ uuid: uuid as string, name })

            if (response) {
                onClose()
            }
        } catch (error: any) {
            if (error instanceof AxiosError) {
                handleApiError(error)
            }
            console.log(error)
        }
    }, [name, onClose, uuid])

    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        // don't allow start with space
        if (e.target.value.startsWith(' ')) {
            return
        }

        setName(e.target.value)
    }

    return (
        <main className="w-[550px] max-w-full">
            <div className="p-4">
                <p className="mb-4 text-sm">Mọi người đều biết khi tên nhóm chat thay đổi.</p>
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Tên đoạn chat"
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-4 text-sm focus:border-primary focus:outline-none dark:border-zinc-500 dark:text-white dark:focus:border-primary"
                        maxLength={MAX_LENGTH}
                        value={name}
                        onChange={handleChangeName}
                        spellCheck={false}
                    />
                    <span className="absolute right-3 top-2 text-xs">
                        {name.length}/{MAX_LENGTH}
                    </span>
                </div>
                <div className="flex justify-end gap-2">
                    <Button buttonType="rounded" className="w-fit bg-transparent dark:bg-transparent" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button
                        buttonType="rounded"
                        className="w-fit !bg-primary !text-white dark:hover:!bg-primary/85"
                        onClick={handleRename}
                    >
                        Lưu
                    </Button>
                </div>
            </div>
        </main>
    )
}

export default memo(RenameConversationModal)
