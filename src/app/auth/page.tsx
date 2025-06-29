import { Metadata } from 'next'
import Image from 'next/image'

import AuthForm from './components/AuthForm'
import Logo from '~/components/Logo/Logo'

export const metadata: Metadata = {
    title: 'Login to Huấn Cánh Cụt',
    description: 'Login to Huấn Cánh Cụt',
}

const Login: React.FC = () => {
    return (
        <main className="grid min-h-dvh w-full grid-cols-12 dark:bg-dark dark:text-dark">
            <div className="col-span-12 p-8 sm:col-span-6">
                <Logo />
                <h1 className="mt-3 flex flex-col text-center font-bold">
                    Đăng nhập vào <span className="mt-2 text-3xl text-cyan-800 dark:text-cyan-500">Huấn Cánh Cụt</span>
                </h1>

                <AuthForm />
            </div>
            <div className="relative col-span-6 hidden h-dvh sm:block">
                <Image
                    className="rounded-bl-3xl rounded-tl-3xl"
                    src="/static/media/login-form.jpg"
                    alt="login"
                    fill
                    style={{ objectFit: 'cover' }}
                    quality={100}
                    sizes="(100%, 100dvh)"
                    priority
                />
            </div>
        </main>
    )
}

export default Login
