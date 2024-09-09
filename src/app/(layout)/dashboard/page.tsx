'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { getCurrentUser } from '~/redux/selectors'

const Dashboard: React.FC = () => {
    const currentUser = useSelector(getCurrentUser)
    const router = useRouter()

    useEffect(() => {
        if (!currentUser) {
            return router.push('/login')
        }
    }, [currentUser, router])

    if (!currentUser) {
        return <></>
    }

    return (
        <main>
            <h1>dashboard</h1>
        </main>
    )
}

export default Dashboard
