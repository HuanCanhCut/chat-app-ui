'use client'
import { useEffect } from 'react'

import * as authServices from '~/services/authService'
import { setCurrentUser } from '~/redux/reducers/auth'
import { useDispatch } from 'react-redux'

const RootLayout = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useDispatch()

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const response = await authServices.getCurrentUser()

                if (response.status === 200) {
                    return dispatch(setCurrentUser(response.data.data))
                }

                dispatch(setCurrentUser(null))
            } catch (error) {
                console.log(error)
            }
        }

        getCurrentUser()
    }, [dispatch])

    return <>{children}</>
}

export default RootLayout
