import React, { useCallback, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import ReactModal from 'react-modal'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AxiosError } from 'axios'
import useSWR from 'swr'

import { faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from '~/components/Button'
import CustomImage from '~/components/Image'
import SWRKey from '~/enum/SWRKey'
import handleApiError from '~/helpers/handleApiError'
import MessageImagesModel from '~/layouts/Chat/Message/Modal/MessageImagesModal'
import * as messageServices from '~/services/messageService'
import { MessageModel } from '~/type/type'

interface MediaAndLinkProps {
    onBack: () => void
    defaultActiveTab: 'media' | 'link'
}

interface Tab {
    title: string
    type: string
}

const tabs: Tab[] = [
    {
        title: 'File phương tiện',
        type: 'media',
    },
    {
        title: 'Liên kết',
        type: 'link',
    },
]

const PER_PAGE = 20

const MediaAndLink: React.FC<MediaAndLinkProps> = ({ onBack, defaultActiveTab }) => {
    const { uuid } = useParams()

    const [activeTab, setActiveTab] = useState<Tab>(tabs.find((tab) => tab.type === defaultActiveTab) || tabs[0])
    const [openImageModal, setOpenImageModal] = useState({
        isOpen: false,
        image: '',
    })

    const groupedMediaByMonth = (media: MessageModel[]) => {
        return media.reduce(
            (acc: Record<string, MessageModel[]>, cur: MessageModel) => {
                const month = new Date(cur.created_at).getMonth()
                const year = new Date(cur.created_at).getFullYear()

                const currentYear = new Date().getFullYear()

                const key = year !== currentYear ? `Tháng ${month + 1} năm ${year}` : `Tháng ${month + 1}`

                if (!acc[key]) {
                    acc[key] = []
                }

                acc[key].push(cur)

                return acc
            },
            {} as Record<string, MessageModel[]>,
        )
    }

    const { data: media, mutate: mutateMedia } = useSWR<{
        data: Record<string, MessageModel[]>
        meta: { pagination: { current_page: number; total_pages: number } }
    }>(activeTab.type === 'media' ? [SWRKey.GET_MESSAGE_IMAGES, activeTab.type, uuid] : null, async () => {
        const response = await messageServices.getMessageImages({
            conversationUuid: uuid as string,
            page: 1,
            per_page: PER_PAGE,
        })

        if (!response?.data)
            return {} as {
                data: Record<string, MessageModel[]>
                meta: { pagination: { current_page: number; total_pages: number } }
            }

        return {
            data: groupedMediaByMonth(response.data),
            meta: response?.meta,
        }
    })

    const { data: links, mutate: mutateLinks } = useSWR(
        activeTab.type === 'link' ? [SWRKey.GET_MESSAGE_LINKS_PREVIEW, activeTab.type, uuid] : null,
        async () => {
            return await messageServices.getMessageLinksPreview({
                conversationUuid: uuid as string,
                page: 1,
                per_page: PER_PAGE,
            })
        },
    )

    const handleCloseImageModal = useCallback(() => {
        setOpenImageModal({
            isOpen: false,
            image: '',
        })
    }, [])

    const handleOpenImageModal = useCallback((image: string) => {
        setOpenImageModal({
            isOpen: true,
            image,
        })
    }, [])

    return (
        <div className="flex max-h-[calc(100dvh-var(--header-height-mobile))] flex-col overflow-hidden">
            <ReactModal
                isOpen={openImageModal.isOpen}
                ariaHideApp={false}
                overlayClassName="overlay"
                closeTimeoutMS={200}
                onRequestClose={handleCloseImageModal}
                className="fixed bottom-0 left-0 right-0 top-0"
            >
                <MessageImagesModel onClose={handleCloseImageModal} imageUrl={openImageModal.image} />
            </ReactModal>

            <div>
                <div className="flex items-center gap-2">
                    <Button buttonType="icon" className="bg-transparent dark:bg-transparent" onClick={onBack}>
                        <FontAwesomeIcon icon={faArrowLeft} width={16} height={16} />
                    </Button>
                    <span className="font-medium">File phương tiện và liên kết</span>
                </div>

                <div className="mt-4 flex items-center px-2">
                    {tabs.map((tab, index) => {
                        return (
                            <div key={index} className="w-full">
                                <Button
                                    buttonType="rounded"
                                    className={`w-full whitespace-nowrap bg-transparent !py-3 text-center dark:bg-transparent ${tab.type === activeTab.type ? 'text-[#0064D1] hover:bg-transparent dark:text-[#5AA7FF] dark:hover:bg-transparent' : 'text-systemMessageLight dark:text-systemMessageDark'}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab.title}
                                </Button>

                                {tab.type === activeTab.type && <div className="h-[3px] w-full bg-primary" />}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto pl-2" id="media-scrollable">
                {activeTab.type === 'media' && media && (
                    <>
                        <InfiniteScroll
                            dataLength={Object.keys(media).length || 0}
                            next={async () => {
                                try {
                                    const response = await messageServices.getMessageImages({
                                        page: media.meta.pagination.current_page + 1,
                                        per_page: PER_PAGE,
                                        conversationUuid: uuid as string,
                                    })

                                    if (!response?.data) return

                                    mutateMedia(
                                        (
                                            prev:
                                                | {
                                                      data: Record<string, MessageModel[]>
                                                      meta: {
                                                          pagination: { current_page: number; total_pages: number }
                                                      }
                                                  }
                                                | undefined,
                                        ) => {
                                            if (!prev) {
                                                return prev
                                            }

                                            return {
                                                data: {
                                                    ...prev.data,
                                                    ...groupedMediaByMonth(response.data),
                                                },
                                                meta: {
                                                    pagination: {
                                                        ...prev.meta.pagination,
                                                        current_page: prev.meta.pagination.current_page + 1,
                                                    },
                                                },
                                            }
                                        },
                                        {
                                            revalidate: false,
                                        },
                                    )
                                } catch (error) {
                                    if (error instanceof AxiosError) {
                                        handleApiError(error)
                                    }
                                }
                            }}
                            className="!overflow-hidden pr-2"
                            hasMore={
                                media ? media.meta.pagination.current_page < media.meta.pagination.total_pages : false
                            }
                            loader={
                                <div className="flex justify-center">
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                </div>
                            }
                            scrollableTarget="media-scrollable"
                        >
                            <div className="space-y-4">
                                {Object.keys(media.data).map((title, index) => {
                                    return (
                                        <div key={index}>
                                            <span className="text-lg font-semibold leading-5 dark:text-[#E2E5E9]">
                                                {title}
                                            </span>

                                            <div className="mt-1 grid max-w-full grid-cols-3 gap-[6px]">
                                                {media.data[title].map((message) => {
                                                    return (
                                                        <div key={message.id}>
                                                            {JSON.parse(message.content!).map(
                                                                (url: string, index: number) => {
                                                                    return (
                                                                        <CustomImage
                                                                            key={index}
                                                                            src={url}
                                                                            alt={'ảnh'}
                                                                            className="aspect-square w-full object-cover"
                                                                            onClick={() => {
                                                                                handleOpenImageModal(url)
                                                                            }}
                                                                        />
                                                                    )
                                                                },
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </InfiniteScroll>
                    </>
                )}

                {activeTab.type === 'link' && (
                    <>
                        <InfiniteScroll
                            dataLength={links?.data.length || 0}
                            next={async () => {
                                try {
                                    const response = await messageServices.getMessageLinksPreview({
                                        conversationUuid: uuid as string,
                                        page: links!.meta.pagination.current_page + 1,
                                        per_page: PER_PAGE,
                                    })

                                    if (!response?.data) return

                                    mutateLinks(
                                        (prev) => {
                                            if (!prev) {
                                                return prev
                                            }

                                            return {
                                                ...prev,
                                                data: [...prev.data, ...response.data],
                                                meta: {
                                                    pagination: {
                                                        ...prev.meta.pagination,
                                                        current_page: prev.meta.pagination.current_page + 1,
                                                        total_pages: response.meta.pagination.total_pages,
                                                    },
                                                },
                                            }
                                        },
                                        {
                                            revalidate: false,
                                        },
                                    )
                                } catch (error) {
                                    if (error instanceof AxiosError) {
                                        handleApiError(error)
                                    }
                                }
                            }}
                            className="!overflow-hidden pr-2"
                            hasMore={
                                links?.meta
                                    ? links.meta.pagination.current_page < links.meta.pagination.total_pages
                                    : false
                            }
                            loader={
                                <div className="flex justify-center">
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                </div>
                            }
                            scrollableTarget="media-scrollable"
                        >
                            <div className="">
                                {links?.data.map((link, index) => {
                                    return (
                                        <Link
                                            href={link.originalUrl}
                                            target="_blank"
                                            key={index}
                                            className={`flex items-center overflow-hidden py-3 ${index !== 0 && index !== links?.data.length - 1 ? 'border-t border-black/10 dark:border-white/10' : ''}`}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={link.image}
                                                alt={link.title}
                                                className="aspect-square w-[52px] rounded-md object-cover object-center"
                                            />

                                            <p className="ml-2 truncate text-base font-medium">{link.title}</p>
                                        </Link>
                                    )
                                })}
                            </div>
                        </InfiniteScroll>
                    </>
                )}
            </div>
        </div>
    )
}

export default MediaAndLink
