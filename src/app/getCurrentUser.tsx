'use client'

import { useDispatch } from 'react-redux'
import { setCurrentUser } from '~/redux/reducers/auth'
import * as authService from '~/services/authService'

const GetCurrentUser = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useDispatch()

    const getCurrentUser = async () => {
        const response = await authService.getCurrentUser()

        if (response.status === 200) {
            return dispatch(setCurrentUser(response.data.data))
        }

        return dispatch(setCurrentUser(null))
    }

    getCurrentUser()
    return <>{children}</>
}

export default GetCurrentUser
