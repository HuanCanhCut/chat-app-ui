'use client'

import { useEffect, useRef, useState, memo } from 'react'
import { showToast } from '~/project/services'
import * as authService from '~/services/authService'

interface Props {
    emailRef: React.RefObject<HTMLInputElement>
}

const SendVerifyCode: React.FC<Props> = ({ emailRef }) => {
    const [sendSuccess, setSendSuccess] = useState(false)
    const [counter, setCounter] = useState(60)

    const timerId = useRef<any>(null)

    useEffect(() => {
        if (!sendSuccess) return

        timerId.current = setInterval(() => {
            setCounter((prev) => {
                return prev - 1
            })
        }, 1000)
    }, [sendSuccess])

    useEffect(() => {
        if (counter === 0) {
            clearInterval(timerId.current)
            setCounter(60)
            setSendSuccess(false)
        }
    }, [counter])

    const handleSendCode = async () => {
        try {
            if (sendSuccess) return

            if (!emailRef.current?.value) {
                showToast({ message: 'Email không được bỏ trống', type: 'error' })
                return
            }

            const response = await authService.sendVerifyCode(emailRef.current?.value)

            if (response.status === 204) {
                showToast({
                    message: 'Mã xác nhận đã được gửi đến email của bạn, nếu không thấy hãy kiểm tra thư rác hoặc spam',
                    type: 'success',
                })
            }

            setSendSuccess(true)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <button
            type="button"
            className="absolute right-0 h-full min-w-16 rounded-br-lg rounded-tr-lg bg-primary px-2 text-sm font-medium text-white"
            onClick={handleSendCode}
        >
            {sendSuccess ? (
                <span className="flex h-full items-center justify-center text-lg font-semibold leading-[0px]">
                    {counter}
                </span>
            ) : (
                'Gửi mã'
            )}
        </button>
    )
}

export default memo(SendVerifyCode)
