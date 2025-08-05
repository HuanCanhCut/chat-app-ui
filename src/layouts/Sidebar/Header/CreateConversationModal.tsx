import { useCallback, useEffect, useRef, useState } from 'react'

import { faCamera, faFileUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import AddMemberPreview from '~/components/AddMemberPreview'
import Button from '~/components/Button'
import UserAvatar from '~/components/UserAvatar'
import { listenEvent } from '~/helpers/events'
import handleApiError from '~/helpers/handleApiError'
import * as conversationService from '~/services/conversationService'
import { UserModel } from '~/type/type'
import { toast } from '~/utils/toast'

export interface FieldValue {
    group_name: string
    avatar: Avatar | null
}

interface Avatar extends File {
    preview: string
}

interface ImperativeHandle {
    GET_PREVIEW_MEMBER: () => UserModel[]
}

const CreateConversationModal = () => {
    const avatarInputRef = useRef<HTMLInputElement>(null)
    const groupNameRef = useRef<HTMLInputElement>(null)

    const [errorMessage, setErrorMessage] = useState('')

    const [fields, setFields] = useState<FieldValue>({
        group_name: '',
        avatar: null,
    })

    const addMemberPreviewRef = useRef<ImperativeHandle>(null)

    useEffect(() => {
        if (groupNameRef.current) {
            groupNameRef.current.focus()
        }
    }, [])

    useEffect(() => {
        return () => {
            if (fields.avatar && fields.avatar.preview) {
                URL.revokeObjectURL(fields.avatar.preview)
            }
        }
    }, [fields.avatar])

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] as Avatar

        if (fields.avatar && fields.avatar.preview) {
            URL.revokeObjectURL(fields.avatar.preview)
        }

        if (file) {
            if (file.size > 1024 * 1024 * 5) {
                setErrorMessage('Ảnh không được lớn hơn 5MB')
                return
            }

            setErrorMessage('')

            const blob = URL.createObjectURL(file)

            file.preview = blob

            setFields({ ...fields, avatar: file })
        }
    }

    const setFieldsValue = ({ target: { name, value } }: React.ChangeEvent<HTMLInputElement>) => {
        if (errorMessage.trim()) {
            setErrorMessage('')
        }

        setFields({ ...fields, [name]: value })
    }

    const handleCreateConversation = useCallback(async () => {
        try {
            const validations = {
                group_name: { isValid: !!fields.group_name.trim(), message: 'Tên nhóm không được để trống' },
                avatar: { isValid: !!fields.avatar, message: 'Ảnh không được để trống' },
            }

            let err = ''

            for (const key in validations) {
                const validationKey = key as keyof typeof validations
                if (!validations[validationKey].isValid) {
                    err += validations[validationKey].message + '\n'
                }
            }

            if (addMemberPreviewRef.current?.GET_PREVIEW_MEMBER().length === 0) {
                err += 'Vui lòng chọn ít nhất một thành viên để tạo nhóm.'
            }

            if (err) {
                setErrorMessage(err)
                return
            }

            const formData = new FormData()

            formData.append('name', fields.group_name)
            formData.append('avatar', fields.avatar as File)

            addMemberPreviewRef.current?.GET_PREVIEW_MEMBER().forEach((user) => {
                formData.append('user_id[]', user.id.toString())
            })

            toast('Đang tạo nhóm, vui lòng đợi...', 'info')

            await conversationService.createConversation({ formData })

            toast('Tạo nhóm thành công', 'success')
        } catch (error) {
            handleApiError(error)
        }
    }, [fields])

    useEffect(() => {
        const remove = listenEvent({
            eventName: 'add_member:preview',
            handler: ({ detail }: { detail: { previewMember: UserModel[] } }) => {
                if (detail.previewMember.length && errorMessage) {
                    setErrorMessage('')
                }
            },
        })

        return remove
    }, [errorMessage])

    return (
        <div className="flex h-full max-h-full flex-col items-center overflow-hidden">
            {fields.avatar && fields.avatar.preview ? (
                <div className="relative">
                    <UserAvatar src={fields.avatar.preview} className="mt-4 !cursor-default" size={96} />
                    <label
                        htmlFor="create-conversation-avatar-input"
                        className="absolute bottom-0 right-0 flex aspect-square h-7 cursor-pointer items-center justify-center rounded-full border border-dashed border-zinc-700 dark:border-zinc-300"
                    >
                        <FontAwesomeIcon icon={faCamera} className="text-2xl" width={16} height={16} />
                    </label>
                </div>
            ) : (
                <label
                    className={`mt-4 flex aspect-square min-h-24 cursor-pointer flex-col items-center justify-center rounded-full border border-dashed ${errorMessage && !fields.avatar ? 'border-error' : 'border-zinc-700 dark:border-zinc-300'} ${fields.avatar ? 'border-none' : ''} `}
                    htmlFor="create-conversation-avatar-input"
                >
                    <FontAwesomeIcon icon={faFileUpload} className="mb-2 text-2xl" width={40} height={40} />
                    <span className="flex select-none flex-col items-center text-sm">
                        <span>Tải ảnh lên</span>
                        <span className="text-xs">(Max: 5MB)</span>
                    </span>
                </label>
            )}

            <div className="flex w-full flex-col overflow-hidden p-4">
                <div className="mt-4">
                    <input
                        type="file"
                        name="avatar"
                        id="create-conversation-avatar-input"
                        hidden
                        onChange={handleAvatarChange}
                        ref={avatarInputRef}
                    />

                    <input
                        type="text"
                        name="group_name"
                        className="w-full rounded-lg border border-gray-300 bg-gray-100 p-2 outline-none dark:border-zinc-700 dark:bg-darkGray"
                        placeholder="Nhập tên nhóm"
                        value={fields.group_name}
                        onChange={setFieldsValue}
                    />
                </div>

                <AddMemberPreview className="flex-auto" ref={addMemberPreviewRef} />

                {errorMessage && <span className="mt-1 whitespace-pre-wrap text-sm text-error">{errorMessage}</span>}

                <div className="mt-4">
                    <Button buttonType="primary" className="w-full" type="button" onClick={handleCreateConversation}>
                        Tạo nhóm
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default CreateConversationModal
