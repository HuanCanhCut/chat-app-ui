import { Suspense } from 'react'

import CallClient from '~/layouts/Call'

const CallPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CallClient />
        </Suspense>
    )
}

export default CallPage
