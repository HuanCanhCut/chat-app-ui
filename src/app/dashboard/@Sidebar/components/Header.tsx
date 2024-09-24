'use client'

import { memo } from 'react'
import useSWR from 'swr'

import config from '~/config'
import * as authService from '~/services/authService'

const Header = () => {
    // fetch current user use swr
    const {
        data: currentUser,
        error,
        mutate,
    } = useSWR(config.apiEndpoint.auth.me, () => {
        return authService.getCurrentUser()
    })

    return (
        <header className="p-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"></div>
            </div>
        </header>
    )
}

export default memo(Header)
