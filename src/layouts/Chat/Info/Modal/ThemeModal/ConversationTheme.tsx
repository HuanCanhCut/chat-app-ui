import { memo, useCallback, useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useSelector } from 'react-redux'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

import MessagePreview from './MessagePreview'
import ThemeItem from './ThemeItem'
import { faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from '~/components/Button'
import SWRKey from '~/enum/SWRKey'
import handleApiError from '~/helpers/handleApiError'
import { getCurrentTheme } from '~/redux/selector'
import * as themeService from '~/services/themeService'
import { ConversationThemeModel, ConversationThemeResponse } from '~/type/type'
import { toast } from '~/utils/toast'

interface ConversationThemeProps {
    onClose: () => void
    currentTheme: ConversationThemeModel
}

const PER_PAGE = 15

interface MessagePreviewProps {
    id: number
    content: string
    type: 'sender' | 'receiver' | 'system'
}

const mockMessage: MessagePreviewProps[] = [
    {
        id: 1,
        content: 'Có rất nhiều chủ đề để bạn lựa chọn và những chủ đề này đều khác nhau đôi chút.',
        type: 'sender',
    },
    {
        id: 2,
        content: 'Tin nhắn mà bạn gửi cho người khác sẽ có màu này.',
        type: 'sender',
    },
    {
        id: 3,
        content: 'Tin nhắn của bạn bè sẽ tương tự như thế này.',
        type: 'receiver',
    },
    {
        id: 4,
        content: new Date().toLocaleString(),
        type: 'system',
    },
    {
        id: 5,
        content: 'Nhấn vào "Chọn" để chọn chủ đề này hoặc "Hủy" để thay đổi.',
        type: 'sender',
    },
]

const ConversationTheme: React.FC<ConversationThemeProps> = ({ onClose, currentTheme }) => {
    const { uuid } = useParams()

    const theme: 'light' | 'dark' = useSelector(getCurrentTheme)

    const themeContainerRef = useRef<HTMLDivElement>(null)

    const [activeTheme, setActiveTheme] = useState<ConversationThemeModel>(currentTheme)

    const { data: themes, mutate } = useSWR(SWRKey.GET_THEMES, () => {
        return themeService.getThemes({
            page: 1,
            per_page: PER_PAGE,
        })
    })

    const handleLoadMoreThemes = useCallback(async () => {
        try {
            const res = await themeService.getThemes({
                page: themes ? themes?.meta.pagination.current_page + 1 : 1,
                per_page: PER_PAGE,
            })

            mutate((prev: ConversationThemeResponse | undefined) => {
                if (!prev) return res

                return {
                    ...prev,
                    data: [...prev.data, ...res.data],
                    meta: res.meta,
                }
            }, false)
        } catch (error) {
            toast('Tải thêm chủ đề thất bại!', 'error')
        }
    }, [mutate, themes])

    const handleChooseTheme = useCallback((theme: ConversationThemeModel) => {
        if (window.innerWidth < 768) {
            if (themeContainerRef.current) {
                themeContainerRef.current.style.transform = `translateX(-50%)`
            }
        }

        setActiveTheme(theme)
    }, [])

    useEffect(() => {
        window.addEventListener('resize', () => {
            if (themeContainerRef.current) {
                if (window.innerWidth > 768 && themeContainerRef.current.style.transform) {
                    themeContainerRef.current.style.transform = `translateX(0)`
                }
            }
        })

        return () => {
            window.removeEventListener('resize', () => {})
        }
    }, [])

    const handleClosePreview = useCallback(() => {
        if (themeContainerRef.current) {
            themeContainerRef.current.style.transform = `translateX(0)`
        }
    }, [])

    const handleChangeTheme = useCallback(async () => {
        if (activeTheme.id === currentTheme.id) return

        try {
            const res = await themeService.updateConversationTheme({
                conversationUuid: uuid as string,
                themeId: activeTheme.id,
            })

            if (res) {
                onClose()
            }
        } catch (error: any) {
            handleApiError(error)
        }
    }, [activeTheme.id, currentTheme.id, onClose, uuid])

    return (
        <>
            <main className="flex w-[700px] max-w-full flex-1 flex-col overflow-hidden">
                <div
                    ref={themeContainerRef}
                    className="flex h-full w-[200%] flex-1 overflow-hidden py-4 pr-0 transition-all duration-100 ease-linear md:w-full md:translate-x-0 md:p-5"
                >
                    <div className="w-full pr-1 [overflow-y:overlay] md:w-1/2" id="theme-scrollable">
                        <div className="border-1 border-b border-[#D0D3D7] pb-3 dark:border-[#65686C]">
                            <ThemeItem
                                theme={currentTheme}
                                checked
                                active
                                onClick={() => {
                                    handleChooseTheme(currentTheme)
                                }}
                            />
                        </div>

                        <div className="pt-3">
                            <InfiniteScroll
                                dataLength={themes?.data.length || 0} //This is important field to render the next data
                                next={handleLoadMoreThemes}
                                className="!overflow-hidden"
                                hasMore={
                                    themes
                                        ? themes?.meta.pagination.current_page < themes?.meta.pagination.total_pages
                                        : false
                                }
                                scrollThreshold={0.8}
                                loader={
                                    <div className="flex justify-center">
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                    </div>
                                }
                                scrollableTarget="theme-scrollable"
                            >
                                {themes?.data.map((theme) => {
                                    if (theme.id === currentTheme.id) {
                                        return null
                                    }

                                    return (
                                        <ThemeItem
                                            key={theme.id}
                                            theme={theme}
                                            className={`${activeTheme.id !== theme.id && 'hover:bg-[#a7a7a720] dark:hover:bg-[#3b3d3ead]'}`}
                                            onClick={() => handleChooseTheme(theme)}
                                            active={activeTheme.id === theme.id}
                                        />
                                    )
                                })}
                            </InfiniteScroll>
                        </div>
                    </div>
                    <div className="flex w-full flex-col pl-2 md:w-1/2">
                        <Button
                            buttonType="rounded"
                            className="mb-2 block w-fit bg-transparent dark:bg-transparent md:hidden"
                            onClick={handleClosePreview}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </Button>
                        <div
                            className="flex min-h-[450px] flex-1 flex-col rounded-xl border border-[#D0D3D7] px-3 pt-3 dark:border-[#65686C] md:ml-5"
                            style={{
                                backgroundImage: `url(${activeTheme.theme_config.background_theme[theme].background})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                backgroundAttachment: 'fixed',
                            }}
                        >
                            {mockMessage.map((message, index) => {
                                return (
                                    <MessagePreview
                                        key={message.id}
                                        content={message.content}
                                        index={index}
                                        currentTheme={activeTheme}
                                        type={message.type}
                                    />
                                )
                            })}
                        </div>
                    </div>
                </div>
            </main>
            <footer className="flex items-center justify-end gap-2 p-4 [&_button]:flex-1">
                <Button buttonType="rounded" onClick={onClose} className="font-medium">
                    Hủy
                </Button>
                <Button
                    buttonType="primary"
                    disabled={activeTheme.id === currentTheme.id}
                    className="font-medium"
                    onClick={handleChangeTheme}
                >
                    Chọn
                </Button>
            </footer>
        </>
    )
}

export default memo(ConversationTheme)
