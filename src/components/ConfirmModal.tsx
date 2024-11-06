import Button from './Button'
import PopperWrapper from './PopperWrapper'
import ReactModal from 'react-modal'

interface ConfirmModelProps {
    title: string
    onConfirm: () => void
    isOpen: boolean
    closeModal: () => void
}

const ConfirmModel = ({ title, onConfirm, isOpen, closeModal }: ConfirmModelProps) => {
    return (
        <ReactModal
            isOpen={isOpen}
            ariaHideApp={false}
            overlayClassName="overlay"
            closeTimeoutMS={200}
            onRequestClose={closeModal}
            className="modal"
        >
            <PopperWrapper className="w-[400px] p-4">
                <>
                    <header>
                        <h3 className="text-center text-2xl">{title}</h3>
                    </header>

                    <div className="flex-center mt-2 gap-4">
                        <Button buttonType="primary" className="flex-1 rounded-sm !py-2" onClick={onConfirm}>
                            Xác nhận
                        </Button>
                        <Button buttonType="outline" className="flex-1 rounded-sm !py-2" onClick={closeModal}>
                            Hủy
                        </Button>
                    </div>
                </>
            </PopperWrapper>
        </ReactModal>
    )
}

export default ConfirmModel
