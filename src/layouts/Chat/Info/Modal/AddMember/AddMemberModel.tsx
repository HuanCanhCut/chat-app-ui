import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'

import AddMemberPreview from '~/components/AddMemberPreview'
import Button from '~/components/Button'
import { listenEvent } from '~/helpers/events'
import handleApiError from '~/helpers/handleApiError'
import * as conversationService from '~/services/conversationService'
import { UserModel } from '~/type/type'

interface AddMemberModelProps {
    onClose: () => void
}

interface ImperativeHandle {
    GET_PREVIEW_MEMBER: () => UserModel[]
}

const AddMemberModel: React.FC<AddMemberModelProps> = ({ onClose }) => {
    const { uuid } = useParams()

    const addMemberPreviewRef = useRef<ImperativeHandle>(null)

    const [previewMember, setPreviewMember] = useState<UserModel[]>([])

    useEffect(() => {
        const remove = listenEvent({
            eventName: 'add_member:preview',
            handler: ({ detail }: { detail: { previewMember: UserModel[] } }) => {
                setPreviewMember(detail.previewMember)
            },
        })

        return remove
    })

    const handleAddMember = async () => {
        if (addMemberPreviewRef.current?.GET_PREVIEW_MEMBER().length === 0) {
            return
        }

        try {
            const formData = new FormData()

            addMemberPreviewRef.current?.GET_PREVIEW_MEMBER().forEach((user) => {
                formData.append('user_id[]', user.id.toString())
            })

            const res = await conversationService.addMember({ uuid: uuid as string, formData })

            if (!res) return

            onClose()
        } catch (error: any) {
            handleApiError(error)
        }
    }

    return (
        <>
            <AddMemberPreview ref={addMemberPreviewRef} />

            <div className="w-full px-3">
                <Button
                    buttonType="primary"
                    className="my-4 w-full"
                    onClick={handleAddMember}
                    disabled={previewMember.length === 0}
                >
                    Thêm nguời
                </Button>
            </div>
        </>
    )
}

export default AddMemberModel
