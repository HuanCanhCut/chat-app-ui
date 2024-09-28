import Image from 'next/image'
import AuthForm from './components/AuthForm'

import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Login to Huấn Cánh Cụt',
    description: 'Login to Huấn Cánh Cụt',
}

const Login: React.FC = () => {
    return (
        <main className="grid w-full grid-cols-12 dark:bg-dark dark:text-dark">
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
                <h1 className="mt-3 flex flex-col text-center font-bold">
                    Đăng nhập vào <span className="text-cyan-800 dark:text-cyan-500">Huấn Cánh Cụt</span>
                </h1>

                <AuthForm />
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
