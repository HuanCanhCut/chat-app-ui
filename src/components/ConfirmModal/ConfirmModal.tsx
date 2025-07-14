import Button from '../Button'
import Modal from '../Modal'

interface ConfirmModelProps {
    title: string
    onConfirm: () => void
    isOpen: boolean
    closeModal: () => void
    description?: string
}

const ConfirmModel = ({ title, description, onConfirm, isOpen, closeModal }: ConfirmModelProps) => {
    return (
        <Modal isOpen={isOpen} onClose={closeModal} title={title} popperClassName="w-[550px] pb-4">
            <main className="px-4">
                <p className="mt-2 text-base text-zinc-700 dark:text-zinc-200">{description}</p>
                <div className="mt-8 flex justify-end gap-2">
                    <Button buttonType="outline" className="border-none px-4 py-1 text-primary" onClick={closeModal}>
                        Hủy
                    </Button>
                    <Button buttonType="primary" className="px-6 py-1" onClick={onConfirm}>
                        Xác nhận
                    </Button>
                </div>
            </main>
        </Modal>
    )
}

export default ConfirmModel
