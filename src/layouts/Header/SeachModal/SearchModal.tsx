import { memo } from 'react'
import ReactModal from 'react-modal'

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Search from '~/components/Search'

interface Props {
    isOpen: boolean
    closeModal: () => void
}

const SearchModal: React.FC<Props> = ({ isOpen, closeModal }) => {
    return (
        <ReactModal
            isOpen={isOpen}
            ariaHideApp={false}
            overlayClassName="dark:bg-dark bg-[#ffffff] fixed top-0 left-0 right-0 bottom-0 z-[99] block"
            closeTimeoutMS={200}
            onRequestClose={closeModal}
            className="bg-transparent"
        >
            <div className="fixed bottom-0 left-0 right-0 top-0">
                <header className="flex items-center justify-between gap-4 p-4">
                    <button
                        className="flex-center h-9 w-9 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-darkGray"
                        onClick={closeModal}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>

                    <Search placeholder="Tìm kiếm" className="flex-1" />
                </header>
            </div>
        </ReactModal>
    )
}

export default memo(SearchModal)
