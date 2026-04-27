import React, { useState } from 'react'
import HeadlessTippy from 'huanpenguin-tippy-react/headless'
import { Ellipsis } from 'lucide-react'

import ConfirmModal from '~/components/ConfirmModal'
import PopperWrapper from '~/components/PopperWrapper'
import { Button } from '~/components/ui/button'
import { sendEvent } from '~/helpers/events'
import handleApiError from '~/helpers/handleApiError'
import { cn } from '~/lib/utils'
import * as commentService from '~/services/commentService'
import { CommentResponse } from '~/type/comment'

interface CommentActionsProps {
    className?: string
    comment: CommentResponse
}

const CommentActions: React.FC<CommentActionsProps> = ({ className, comment }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => {},
    })

    // headless tippy visible
    const [isVisible, setIsVisible] = useState(false)

    return (
        <>
            <ConfirmModal
                title={modalState.title}
                description={modalState.description}
                onConfirm={modalState.onConfirm}
                isOpen={modalState.isOpen}
                closeModal={() => setModalState({ ...modalState, isOpen: false })}
            />

            <HeadlessTippy
                visible={isVisible}
                placement="bottom"
                appendTo={document.body}
                interactive
                onClickOutside={() => {
                    setIsVisible(false)
                }}
                render={() => {
                    return (
                        <PopperWrapper>
                            <Button
                                className="cursor-pointer bg-transparent dark:bg-transparent"
                                variant={'ghost'}
                                onClick={() => {
                                    setIsVisible(false)

                                    setModalState({
                                        ...modalState,
                                        isOpen: true,
                                        title: 'Xóa bình luận',
                                        description: 'Bạn có chắc chắn muốn xóa bình luận này không?',
                                        onConfirm: () => {
                                            setModalState({
                                                isOpen: false,
                                                title: '',
                                                description: '',
                                                onConfirm: () => {},
                                            })

                                            // backup comment data before remove. if mutation fail, we can rollback
                                            const commentData = comment

                                            sendEvent('COMMENT:REMOVE', { commentId: comment.id })

                                            // handle call api remove comment
                                            ;(async () => {
                                                try {
                                                    await commentService.deleteComment(comment.id)
                                                } catch (error) {
                                                    handleApiError(error)

                                                    // Rollback if delete comment fail
                                                    sendEvent('COMMENT:NEW', { comment: commentData })
                                                }
                                            })()
                                        },
                                    })
                                }}
                            >
                                Xóa bình luận
                            </Button>
                        </PopperWrapper>
                    )
                }}
            >
                <Button
                    variant={'ghost'}
                    size={'icon'}
                    className={cn('rounded-full', className)}
                    onClick={() => {
                        setIsVisible((prev) => {
                            return !prev
                        })
                    }}
                >
                    <Ellipsis />
                </Button>
            </HeadlessTippy>
        </>
    )
}

export default CommentActions
