import ReactModal from 'react-modal'

import Button from '../Button'
import PopperWrapper from '../PopperWrapper'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    overlayClassName?: string
    className?: string
    title?: string
    popperClassName?: string
    handleAfterClose?: () => void
    handleAfterOpen?: () => void
}

const Modal = ({
    isOpen,
    onClose,
    children,
    overlayClassName = 'overlay',
    className = 'modal',
    title,
    popperClassName,
    handleAfterClose,
    handleAfterOpen,
}: ModalProps) => {
    return (
        <ReactModal
            isOpen={isOpen}
            ariaHideApp={false}
            overlayClassName={overlayClassName}
            closeTimeoutMS={200}
            onRequestClose={onClose}
            className={className}
            onAfterClose={handleAfterClose}
            onAfterOpen={handleAfterOpen}
        >
            <PopperWrapper className={`p-0 ${popperClassName}`}>
                <header className="relative flex justify-center border-b border-gray-300 p-4 dark:border-zinc-700">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <Button buttonType="icon" onClick={onClose} className="absolute top-1/2 right-3 -translate-y-1/2">
                        <FontAwesomeIcon icon={faXmark} className="text-xl" />
                    </Button>
                </header>
                {children}
            </PopperWrapper>
        </ReactModal>
    )
}

export default Modal
