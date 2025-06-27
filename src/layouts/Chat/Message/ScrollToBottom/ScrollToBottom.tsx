import { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { mutate } from 'swr'

import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SWRKey from '~/enum/SWRKey'
import * as messageServices from '~/services/messageService'
import { MessageResponse } from '~/type/type'

interface MessageRef {
    [key: string]: HTMLDivElement
}

interface ScrollToBottomProps {
    offsetRange: { start: number; end: number }
    scrollableRef: React.RefObject<HTMLDivElement>
    messageRefs: React.RefObject<MessageRef>
    PER_PAGE: number
    setOffsetRange: React.Dispatch<React.SetStateAction<{ start: number; end: number }>>
}

const ScrollToBottom = ({ offsetRange, scrollableRef, messageRefs, PER_PAGE, setOffsetRange }: ScrollToBottomProps) => {
    const { uuid } = useParams()

    const scrollToBottomRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (!scrollableRef.current) {
            return
        }

        scrollableRef.current.onscroll = () => {
            if (scrollableRef.current!.scrollTop <= -150 || offsetRange.start !== 0) {
                scrollToBottomRef.current!.style.bottom = '40px'
            } else {
                scrollToBottomRef.current!.style.bottom = '-50px'
            }
        }
    }, [offsetRange.start, scrollableRef])

    useEffect(() => {
        if (offsetRange.start !== 0) {
            scrollToBottomRef.current!.style.bottom = '40px'
        }
    }, [offsetRange.start])

    const handleScrollToBottom = async () => {
        if (offsetRange.start === 0) {
            if (messageRefs.current) {
                const key: string[] = Object.keys(messageRefs.current)

                for (let i = key.length - 1; i >= 0; i--) {
                    if (messageRefs.current[key[i]]) {
                        messageRefs.current[key[i]].scrollIntoView({ behavior: 'smooth', block: 'center' })
                        break
                    }
                }
            }
        } else {
            mutate(
                [SWRKey.GET_MESSAGES, uuid],
                async (prev: MessageResponse | undefined) => {
                    if (!prev) {
                        return prev
                    }

                    const response = await messageServices.getMessages({
                        conversationUuid: uuid as string,
                        limit: PER_PAGE,
                        offset: 0,
                    })

                    if (response) {
                        let newData: MessageResponse

                        // if new data near the bottom of the list
                        if (prev.meta.pagination.offset < PER_PAGE) {
                            const diffOffset = PER_PAGE - prev.meta.pagination.offset
                            response.data.splice(PER_PAGE - diffOffset)

                            newData = {
                                data: [...response?.data, ...prev?.data],
                                meta: response?.meta,
                            }

                            setOffsetRange({
                                start: 0,
                                end: prev.meta.pagination.offset + response.data.length,
                            })
                        } else {
                            newData = {
                                data: [...response?.data],
                                meta: response?.meta,
                            }
                            setOffsetRange({
                                start: 0,
                                end: response?.meta.pagination.offset + PER_PAGE,
                            })
                        }

                        return newData
                    }
                },
                {
                    revalidate: false,
                },
            )
        }
    }

    return (
        <button
            ref={scrollToBottomRef}
            className="flex-center absolute bottom-[-50px] left-1/2 z-50 h-9 w-9 -translate-x-1/2 cursor-pointer rounded-full bg-white shadow-lg transition-all duration-200 ease-linear dark:bg-[#46484b]"
            onClick={handleScrollToBottom}
        >
            <FontAwesomeIcon icon={faArrowDown} width={22} height={22} />
        </button>
    )
}

export default ScrollToBottom
