'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { getCurrentUser } from '~/redux/selectors'
import { UserModel } from '~/type/type'

export default function Home() {
    const currentUser: UserModel | null = useSelector(getCurrentUser)
    const router = useRouter()

    useEffect(() => {
        if (!currentUser) {
            return router.push('/login')
        }
        return router.push('/dashboard')
    }, [currentUser, router])

    return <></>
}
