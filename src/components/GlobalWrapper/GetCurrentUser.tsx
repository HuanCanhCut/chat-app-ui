import { useEffect } from 'react'
import useSWR from 'swr'
import SWRKey from '~/enum/SWRKey'
import * as meServices from '~/services/meService'
import getCurrentUser from '~/zustand/getCurrentUser'

const GetCurrentUser = ({ children }: { children: React.ReactNode }) => {
    const { dispatch } = getCurrentUser()

    const { data: currentUser } = useSWR(SWRKey.GET_CURRENT_USER, () => {
        return meServices.getCurrentUser()
    })

    useEffect(() => {
        dispatch(currentUser)
    }, [currentUser, dispatch])

    return <>{children}</>
}

export default GetCurrentUser
