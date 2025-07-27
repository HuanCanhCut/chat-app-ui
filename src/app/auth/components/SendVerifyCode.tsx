'use client'

import { memo, MutableRefObject, useEffect, useRef, useState } from 'react'

import handleApiError from '~/helpers/handleApiError'
import * as authService from '~/services/authService'
import { toast } from '~/utils/toast'

interface Props {
    emailRef: MutableRefObject<HTMLInputElement | null>
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
                toast('Email không được bỏ trống', 'error')
                return
            }

            if (!/^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/.test(emailRef.current?.value)) {
                toast('Email không đúng định dạng', 'error')
                return
            }

            const response = await authService.sendVerifyCode(emailRef.current?.value)

            console.log(response)

            if (response) {
                toast(
                    'Mã xác nhận đã được gửi đến email của bạn, nếu không thấy hãy kiểm tra thư rác hoặc spam',
                    'success',
                )

                setSendSuccess(true)
            }
        } catch (error: any) {
            handleApiError(error)
        }
    }

    return (
        <button
            type="button"
            className="absolute right-0 top-0 h-full min-w-16 rounded-br-lg rounded-tr-lg bg-primary px-2 text-sm font-medium text-white"
            onClick={handleSendCode}
        >
            {sendSuccess ? (
                <span className="flex h-full items-center justify-center text-lg leading-[0px]">{counter}</span>
            ) : (
                'Gửi mã'
            )}
        </button>
    )
}

export default memo(SendVerifyCode)
