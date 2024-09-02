'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const Dashboard: React.FC = () => {
    const currentUser = false
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
