'use client'
import React, { useRef, useState } from 'react'
import Image from 'next/image'
import { useForm, SubmitHandler } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { signInWithPopup } from 'firebase/auth'

import config from '~/config'
import * as authServices from '~/services/authService'
import { UserModel } from '~/type/type'
import { toast } from '~/helpers/toast'
import SendVerifyCode from './SendVerifyCode'
import Input from '~/components/Input'

export interface FieldValue {
    email: string
    password: string
    rePassword: string
    verifyCode: string
}

interface Response {
    data: UserModel
    meta?: {
        pagination: {
            exp: number
        }
    }
}

const AuthForm = () => {
    const emailRef = useRef<HTMLInputElement | null>(null)

    const [type, setType] = useState<'login' | 'register' | 'forgotPassword'>('login')
    const [showPassword, setShowPassword] = useState<boolean>(false)

    const { handleSubmit, control, setValue } = useForm<FieldValue>()

    const [errorMessage, setErrorMessage] = useState<string>('')

    const onSubmit: SubmitHandler<FieldValue> = (data) => {
        const handleLogin = async () => {
            try {
                const response: Response | undefined = await authServices.login({
                    email: data.email,
                    password: data.password,
                })

                if (response) {
                    window.location.reload()
                    localStorage.setItem('exp', JSON.stringify(response.meta?.pagination?.exp))
                    return
                }

                setErrorMessage('Email hoặc mật khẩu không đúng')
            } catch (error) {
                console.log(error)
            }
        }

        const handleRegister = async () => {
            try {
                if (data.rePassword !== data.password) {
                    setErrorMessage('Xác nhận mật khẩu không đúng, vui lòng thử laị.')
                    return
                }

                const response = await authServices.register({
                    email: data.email,
                    password: data.password,
                })

                if (!response) {
                    toast('Đăng kí thất bại, vui lòng thử lại hoặc liên hệ admin để xử lí.', 'error')
                }
            } catch (error) {
                console.log(error)
            }
        }

        const handleForgotPassword = async () => {
            try {
                if (data.password !== data.rePassword) {
                    return setErrorMessage('Nhập lại mật khẩu không khớp, vui lòng thử lại')
                }

                const response: string | undefined = await authServices.resetPassword({
                    email: data.email,
                    password: data.password,
                    code: data.verifyCode,
                    onError: (error: any) => {
                        setErrorMessage(error?.response?.data?.message)
                    },
                })

                if (response) {
                    toast('Đổi mật khẩu thành công')
                    setType('login')
                    setValue('email', '')
                    setValue('password', '')
                    setValue('verifyCode', '')
                    setValue('rePassword', '')
                    return
                }
            } catch (error) {
                console.log(error)
            }
        }

        switch (type) {
            case 'login':
                handleLogin()
                break
            case 'register':
                handleRegister()
                break
            case 'forgotPassword':
                handleForgotPassword()
                break
            default:
                break
        }
    }

    const handleLoginWithGoogle = async () => {
        try {
            const { user }: any = await signInWithPopup(config.auth, config.googleProvider)

            if (user) {
                const response: Response | undefined = await authServices.loginWithGoogle(user.accessToken)

                if (response) {
                    window.location.reload()
                    if (response.meta) {
                        localStorage.setItem('exp', JSON.stringify(response.meta.pagination.exp))
                    }
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <form className="flex flex-col items-center justify-center gap-3 md:px-6" onSubmit={handleSubmit(onSubmit)}>
            <ul className="mt-3 flex items-center justify-center gap-4">
                <li className="cursor-pointer rounded-full border border-amber-500 p-1" onClick={handleLoginWithGoogle}>
                    <Image src="/static/media/google-icon.png" alt="" width={28} height={28} quality={100} />
                </li>
            </ul>

            <span className="text-small mx-auto text-gray-500 dark:text-gray-400">Hoặc đăng nhập bằng email</span>

            <div className="flex w-full flex-col gap-3">
                <Input
                    name="email"
                    control={control}
                    rules={{
                        required: 'Email không được bỏ trống',
                        pattern: {
                            value: /^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/,
                            message: 'Email không đúng định dạng',
                        },
                        onChange: () => {
                            setErrorMessage('')
                        },
                    }}
                    placeholder="Nhập email của bạn"
                    type="text"
                    ref={emailRef}
                />

                {type === 'forgotPassword' && (
                    <div className="relative">
                        <Input
                            name="verifyCode"
                            rules={{
                                required: 'Mã xác minh không được bỏ trống',

                                onChange: () => {
                                    setErrorMessage('')
                                },
                            }}
                            control={control}
                            placeholder="Mã xác minh"
                            type="text"
                            showIcon={true}
                            Icon={<SendVerifyCode emailRef={emailRef} />}
                            IconClass=""
                        />
                    </div>
                )}

                <div className="relative">
                    <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Nhập mật khẩu"
                        rules={{
                            required: 'Mật khẩu không được bỏ trống',
                            minLength: {
                                value: 6,
                                message: 'Mật khẩu phải có ít nhất 6 kí tự',
                            },
                            onChange: () => {
                                setErrorMessage('')
                            },
                        }}
                        control={control}
                        showIcon={true}
                        Icon={<FontAwesomeIcon className="text-xs" icon={showPassword ? faEye : faEyeSlash} />}
                        setShowIcon={() => {
                            setShowPassword(!showPassword)
                        }}
                    />
                </div>

                {(type === 'register' || type === 'forgotPassword') && (
                    <>
                        <div className="relative">
                            <Input
                                name="rePassword"
                                control={control}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Nhập lại mật khẩu"
                                rules={{
                                    required: 'Nhập lại mật khẩu không được bỏ trống',
                                    onChange: () => {
                                        setErrorMessage('')
                                    },
                                }}
                                showIcon={true}
                                Icon={<FontAwesomeIcon className="text-xs" icon={showPassword ? faEye : faEyeSlash} />}
                                setShowIcon={() => {
                                    setShowPassword(!showPassword)
                                }}
                            />
                        </div>
                    </>
                )}

                {errorMessage && <span className="text-sm text-error">{errorMessage}</span>}

                {type === 'login' && (
                    <span
                        className="mt-1 cursor-pointer text-sm text-gray-500 dark:text-gray-400"
                        onClick={() => {
                            setType('forgotPassword')
                        }}
                    >
                        Quên mật khẩu?
                    </span>
                )}
            </div>

            <button className="w-full rounded-lg bg-primary p-2 text-white" type="submit">
                {type === 'login' ? 'Đăng nhập' : type === 'register' ? 'Đăng kí' : 'Thay đổi mật khẩu'}
            </button>

            <span className="text-center text-sm text-gray-500 dark:text-gray-400">
                Bạn không có tài khoản?{' '}
                <span
                    className="cursor-pointer font-semibold text-primary"
                    onClick={() => setType(type === 'login' ? 'register' : 'login')}
                >
                    {type === 'login' ? 'Đăng kí' : 'Đăng nhập'}
                </span>
            </span>

            <footer className="text-center text-sm text-gray-500 dark:text-gray-400">
                Việc bạn tiếp tục sử dụng trang web này có nghĩa bạn đồng ý với{' '}
                <span className="text-error">điều khoản</span> sử dụng của chúng tôi
            </footer>
        </form>
    )
}

export default AuthForm
