'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'

export default function Home({ children }: { children: React.ReactNode }) {
    const currentUser = false
    const router = useRouter()
    useEffect(() => {
        if (!currentUser) {
            return router.push('/login')
        }
        return router.push('/dashboard')
    }, [currentUser, router])
    return (
        <>
            {children}
            <ToastContainer />
        </>
    )
}
