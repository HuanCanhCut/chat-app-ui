'use client'

import { useRouter } from 'next/navigation'
import Button from '~/components/Button/Button'

const NotFound = () => {
    const router = useRouter()

    return (
        <div className="dark:bg-dark">
            <div className="flex h-screen items-center justify-center">
                <main className="flex w-screen max-w-[500px] flex-col gap-4 text-center">
                    <h1 className="text-7xl font-bold">404</h1>
                    <div className="flex flex-col items-center">
                        <h3>Bạn hiện không thể xem được nội dung này</h3>
                        <p>
                            Lỗi này thường do chủ sở hữu chỉ chia sẻ nội dung với một nhóm nhỏ, thay đổi người được xem
                            hoặc đã xóa nội dung.
                        </p>
                        <Button buttonType="primary" className="mt-4" onClick={() => router.push('/message')}>
                            Đi đến trang chủ
                        </Button>
                        <p className="mt-4 cursor-pointer text-primary hover:underline" onClick={() => router.back()}>
                            Back zề
                        </p>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default NotFound
