import { useCallback } from 'react'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Button from '~/components/Button'
import { sendEvent } from '~/helpers/events'

const ControlPanel = () => {
    const handleToggleInfo = useCallback(() => {
        sendEvent({
            eventName: 'info:toggle',
            detail: {
                isOpen: false,
            },
        })
    }, [])

    return (
        <>
            <Button
                buttonType="icon"
                className="block bg-transparent dark:bg-transparent sm:hidden"
                onClick={handleToggleInfo}
            >
                <FontAwesomeIcon icon={faArrowLeft} />
            </Button>
        </>
    )
}

export default ControlPanel
