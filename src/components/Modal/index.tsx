import ReactModal from 'react-modal'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    overlayClassName?: string
    className?: string
}

const Modal = ({ isOpen, onClose, children, overlayClassName = 'overlay', className = 'modal' }: ModalProps) => {
    return (
        <ReactModal
            isOpen={isOpen}
            ariaHideApp={false}
            overlayClassName={overlayClassName}
            closeTimeoutMS={200}
            onRequestClose={onClose}
            className={className}
        >
            {children}
        </ReactModal>
    )
}

export default Modal
