'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { signInWithPopup } from 'firebase/auth'
import { AxiosResponse } from 'axios'

import config from '~/config'
import * as authServices from '~/services/authService'
import { setCurrentUser } from '~/redux/reducers/auth'
import { UserModel } from '~/type/type'
import { showToast } from '~/project/services'
import { getCurrentUser } from '~/redux/selectors'
import SendVerifyCode from './components/SendVerifyCode'

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

const Login: React.FC = () => {
    const dispatch = useDispatch()
    const router = useRouter()
    const currentUser = useSelector(getCurrentUser)

    const emailRef = useRef<HTMLInputElement | null>(null)

    const [type, setType] = useState<'login' | 'register' | 'forgotPassword'>('login')
    const [showPassword, setShowPassword] = useState<boolean>(false)

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setValue,
    } = useForm<FieldValue>()

    const [errorMessage, setErrorMessage] = useState<string>('')

    useEffect(() => {
        if (currentUser) {
            return router.push('/dashboard')
        }
    }, [currentUser, router])

    const setUserToRedux = (user: UserModel) => {
        dispatch(setCurrentUser(user))

        showToast({
            message: 'Đăng nhập thành công.',
        })

        router.push('/dashboard')
    }

    const onSubmit: SubmitHandler<FieldValue> = (data) => {
        const handleLogin = async () => {
            try {
                const response: AxiosResponse<Response> = await authServices.login({
                    email: data.email,
                    password: data.password,
                })

                switch (response.status) {
                    case 200:
                        setUserToRedux(response.data.data)
                        localStorage.setItem('exp', JSON.stringify(response.data.meta?.pagination?.exp))
                        break
                    case 401:
                        return setErrorMessage('Email hoặc mật khẩu không đúng')
                    default:
                        console.log(response)
                }
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

                const response: AxiosResponse<Response> = await authServices.register({
                    email: data.email,
                    password: data.password,
                })

                if (response?.status === 201) {
                    setUserToRedux(response.data.data)
                    showToast({ message: 'Đăng kí tài khoản thành công' })
                    return
                }

                if (response?.status === 409) {
                    return setErrorMessage('Tài khoản đã tồn tại.')
                }

                setErrorMessage('Đăng kí thất bại, vui lòng thử lại hoặc liên hệ admin để xử lí.')
            } catch (error) {
                console.log(error)
            }
        }

        const handleForgotPassword = async () => {
            try {
                const response: AxiosResponse<Response> = await authServices.resetPassword({
                    email: data.email,
                    password: data.password,
                    code: data.verifyCode,
                })

                if (response.status === 204) {
                    showToast({ message: 'Đổi mật khẩu thành công' })
                    setType('login')
                    setValue('email', '')
                    setValue('password', '')
                    setValue('verifyCode', '')
                    setValue('rePassword', '')
                    return
                }

                if (response.status === 401) {
                    setErrorMessage('Mã xác minh không đúng hoặc đã hết hạn')
                    return
                }

                setErrorMessage('Đổi mật khẩu thất bại, vui lòng thử lại hoặc liên hệ admin để xử lí.')
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
                const response: AxiosResponse<Response> = await authServices.loginWithGoogle(user.accessToken)

                if (response.status === 200) {
                    setUserToRedux(response.data.data)
                    if (response.data.meta) {
                        localStorage.setItem('exp', JSON.stringify(response.data.meta.pagination.exp))
                    }
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <main className="grid w-full grid-cols-12">
            <div className="col-span-12 p-8 sm:col-span-6">
                <Image
                    src="/static/media/logo.png"
                    sizes="1000px"
                    className="mx-auto h-auto w-[120px] sm:mx-0"
                    alt="logo"
                    width="0"
                    height="0"
                    quality={100}
                />

                <form
                    className="flex flex-col items-center justify-center gap-5 md:px-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <h1 className="mt-3 flex flex-col text-center font-bold">
                        Đăng nhập vào <span className="text-cyan-800">Huấn Cánh Cụt</span>
                    </h1>

                    <ul className="flex items-center justify-center gap-4">
                        <li
                            className="cursor-pointer rounded-full border border-amber-500 p-1"
                            onClick={handleLoginWithGoogle}
                        >
                            <Image src="/static/media/google-icon.png" alt="" width={28} height={28} quality={100} />
                        </li>
                    </ul>

                    <span className="text-small text-gray-500">Hoặc đăng nhập bằng email</span>

                    <div className="flex w-full flex-col gap-2">
                        {/* <input
                            type="text"
                            className="w-full rounded-lg border border-gray-500 bg-gray-100 p-2 outline-none"
                            placeholder="Nhập email của bạn"
                            {...register('email', {
                                required: 'Email không được bỏ trống',
                                pattern: {
                                    value: /^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/,
                                    message: 'Email không đúng định dạng',
                                },
                                onChange: () => {
                                    setErrorMessage('')
                                },
                            })}
                            ref={emailRef}
                        /> */}

                        <Controller
                            name="email"
                            control={control}
                            defaultValue=""
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
                            render={({ field }) => (
                                <input
                                    className="w-full rounded-lg border border-gray-500 bg-gray-100 p-2 outline-none"
                                    placeholder="Nhập email của bạn"
                                    type="text"
                                    {...field}
                                    ref={(e) => {
                                        field.ref(e)
                                        emailRef.current = e
                                    }}
                                />
                            )}
                        />

                        {errors.email && <span className="text-sm text-primary">{errors.email.message}</span>}
                        {type === 'forgotPassword' && (
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-gray-500 bg-gray-100 p-2 outline-none"
                                    placeholder="Mã xác minh"
                                    {...register('verifyCode', {
                                        required: 'Mã xác minh không được bỏ trống',

                                        onChange: () => {
                                            setErrorMessage('')
                                        },
                                    })}
                                />
                                <SendVerifyCode emailRef={emailRef} />
                            </div>
                        )}
                        {errors.verifyCode && <span className="text-sm text-primary">{errors.verifyCode.message}</span>}

                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full rounded-lg border border-gray-500 bg-gray-100 p-2 outline-none"
                                placeholder="Nhập mật khẩu"
                                {...register('password', {
                                    required: 'Mật khẩu không được bỏ trống',
                                    minLength: {
                                        value: 6,
                                        message: 'Mật khẩu phải có ít nhất 6 kí tự',
                                    },
                                    onChange: () => {
                                        setErrorMessage('')
                                    },
                                })}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 translate-y-[-50%] leading-none text-gray-700"
                                onClick={() => {
                                    setShowPassword(!showPassword)
                                }}
                            >
                                <FontAwesomeIcon className="text-xs" icon={showPassword ? faEye : faEyeSlash} />
                            </button>
                        </div>
                        {errors.password && <span className="text-sm text-primary">{errors.password.message}</span>}

                        {type === 'login' && (
                            <span
                                className="mt-1 cursor-pointer text-sm text-gray-500"
                                onClick={() => {
                                    setType('forgotPassword')
                                }}
                            >
                                Quên mật khẩu?
                            </span>
                        )}

                        {(type === 'register' || type === 'forgotPassword') && (
                            <>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-full rounded-lg border border-gray-500 bg-gray-100 p-2 outline-none"
                                        placeholder="Nhập lại mật khẩu"
                                        {...register('rePassword', {
                                            required: 'Nhập lại mật khẩu không được bỏ trống',
                                            onChange: () => {
                                                setErrorMessage('')
                                            },
                                        })}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 translate-y-[-50%] leading-none text-gray-700"
                                        onClick={() => {
                                            setShowPassword(!showPassword)
                                        }}
                                    >
                                        <FontAwesomeIcon className="text-xs" icon={showPassword ? faEye : faEyeSlash} />
                                    </button>
                                </div>
                                {errors.rePassword && (
                                    <span className="text-sm text-primary">{errors.rePassword.message}</span>
                                )}
                            </>
                        )}

                        {errorMessage && <span className="text-sm text-primary">{errorMessage}</span>}
                    </div>

                    <button className="w-full rounded-lg bg-primary p-2 text-white" type="submit">
                        {type === 'login' ? 'Đăng nhập' : type === 'register' ? 'Đăng kí' : 'Thay đổi mật khẩu'}
                    </button>

                    <span className="text-center text-sm text-gray-500">
                        Bạn không có tài khoản?{' '}
                        <span
                            className="cursor-pointer font-semibold text-primary"
                            onClick={() => setType(type === 'login' ? 'register' : 'login')}
                        >
                            {type === 'login' ? 'Đăng kí' : 'Đăng nhập'}
                        </span>
                    </span>

                    <footer className="text-center text-sm text-gray-500">
                        Việc bạn tiếp tục sử dụng trang web này có nghĩa bạn đồng ý với{' '}
                        <span className="text-primary">điều khoản</span> sử dụng của chúng tôi
                    </footer>
                </form>
            </div>
            <div className="relative col-span-6 hidden h-screen sm:block">
                <Image
                    className="rounded-bl-3xl rounded-tl-3xl"
                    src="/static/media/login-form.jpg"
                    alt="login"
                    fill
                    style={{ objectFit: 'cover' }}
                    quality={100}
                    sizes="(100%, 100vh)"
                    priority
                />
            </div>
        </main>
    )
}

export default Login
