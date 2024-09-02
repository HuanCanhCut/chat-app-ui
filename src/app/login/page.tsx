'use client'

import React from 'react'
import Image from 'next/image'
import { useForm, SubmitHandler } from 'react-hook-form'

interface FieldValue {
    email: string
    password: string
    rePassword?: string
}

const Login: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FieldValue>()

    const onSubmit: SubmitHandler<FieldValue> = (data) => {
        console.log(data)
    }

    return (
        <main className="grid w-full grid-cols-12">
            <div className="col-span-12 p-8 sm:col-span-7">
                <Image
                    src="/static/media/logo.png"
                    className="mx-auto sm:mx-0"
                    alt="logo"
                    width={120}
                    height={62}
                    quality={100}
                />

                <form
                    className="flex flex-col items-center justify-center gap-5 md:px-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <h1 className="mt-3 text-center font-bold">Đăng nhập vào HuanPG</h1>

                    <ul className="flex items-center justify-center gap-4">
                        <li className="cursor-pointer rounded-full border border-amber-500 p-1">
                            <Image src="/static/media/google-icon.png" alt="" width={28} height={28} quality={100} />
                        </li>
                        <li className="cursor-pointer rounded-full border border-amber-500 p-1">
                            <Image src="/static/media/facebook-icon.png" alt="" width={28} height={28} quality={100} />
                        </li>
                    </ul>

                    <span className="text-small text-gray-500">Hoặc đăng nhập bằng email</span>

                    <div className="flex w-full flex-col gap-2">
                        <input
                            type="text"
                            className="w-full rounded-lg border border-gray-500 bg-gray-100 p-2 outline-none"
                            placeholder="Nhập email của bạn"
                            {...register('email', {
                                required: 'Email không được bỏ trống',
                                pattern: {
                                    value: /^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/,
                                    message: 'Email không đúng định dạng',
                                },
                            })}
                        />
                        {errors.email && <span className="text-primary text-sm">{errors.email.message}</span>}
                        <input
                            type="password"
                            className="w-full rounded-lg border border-gray-500 bg-gray-100 p-2 outline-none"
                            placeholder="Nhập mật khẩu"
                            {...register('password', {
                                required: 'Mật khẩu không được bỏ trống',
                                minLength: {
                                    value: 6,
                                    message: 'Mật khẩu phải có ít nhất 6 kí tự',
                                },
                            })}
                        />
                        {errors.password && <span className="text-primary text-sm">{errors.password.message}</span>}
                    </div>

                    <button className="bg-primary w-full rounded-lg p-2 text-white" type="submit">
                        Đăng nhập
                    </button>

                    <span className="text-center text-sm text-gray-500">
                        Bạn không có tài khoản?{' '}
                        <span className="text-primary cursor-pointer font-semibold">Đăng kí</span>
                    </span>

                    <footer className="text-center text-sm text-gray-500">
                        Việc bạn tiếp tục sử dụng trang web này có nghĩa bạn đồng ý với{' '}
                        <span className="text-primary">điều khoản</span> sử dụng của chúng tôi
                    </footer>
                </form>
            </div>
            <div className="relative col-span-5 hidden h-screen sm:block">
                <Image
                    className="rounded-bl-3xl rounded-tl-3xl"
                    src="/static/media/login-form.jpg"
                    alt="login"
                    layout="fill"
                    objectFit="cover"
                    quality={100}
                />
            </div>
        </main>
    )
}

export default Login
