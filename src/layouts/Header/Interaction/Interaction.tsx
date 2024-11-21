import React from 'react'
import { MessageIcon } from '~/components/Icons'
import Tippy from '@tippyjs/react'
import UserAvatar from '~/components/UserAvatar/UserAvatar'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { faSignOut, faCircleDot, faPen } from '@fortawesome/free-solid-svg-icons'
import { faMoon, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Button from '~/components/Button'
import config from '~/config'
import Notification from '~/components/Notification/Notification'
import CustomTippy from '~/components/CustomTippy/CustomTippy'
import { UserResponse } from '~/type/type'
import * as meService from '~/services/meService'
import * as authService from '~/services/authService'
import PopperWrapper from '~/components/PopperWrapper'
import { sendEvent } from '~/helpers/events'
import AccountItem from '~/components/AccountItem'
import MenuItem from '../MenuItem'
import SWRKey from '~/enum/SWRKey'

export interface MenuItemType {
    type: 'theme' | 'status' | 'logout'
    icon: IconDefinition
    label: string
    line?: boolean
    switchButton?: boolean
}

const MENU_ITEMS: MenuItemType[] = [
    {
        type: 'theme',
        icon: faMoon,
        label: 'Chế độ tối',
        switchButton: true,
    },
    {
        type: 'status',
        icon: faCircleDot,
        label: 'Trạng thái hoạt động',
    },
    {
        type: 'logout',
        icon: faSignOut,
        label: 'Đăng xuất',
        line: true,
    },
]

const Interaction = () => {
    const router = useRouter()
    const { data: currentUser } = useSWR<UserResponse | undefined>(SWRKey.GET_CURRENT_USER, () => {
        return meService.getCurrentUser()
    })

    const handleChoose = (type: MenuItemType['type']) => {
        switch (type) {
            case 'logout':
                sendEvent({ eventName: 'tippy:hide' })
                authService.logout()

                router.push(config.routes.auth)
                router.refresh()
                break
        }
    }

    const renderTooltip = () => {
        return (
            <PopperWrapper className="min-w-[320px] text-sm">
                <header className="p-2">
                    <h4 className="text-center font-semibold">Tùy chọn</h4>
                </header>
                <section>
                    <div className="border-b border-t border-gray-300 px-5 py-2 dark:border-gray-700">
                        <label className="font-semibold">Tài khoản</label>
                        <div className="flex items-center justify-between">
                            {currentUser && <AccountItem user={currentUser?.data} className="mt-2" />}
                            <Button buttonType="icon" href={`/user/@${currentUser?.data?.nickname}`}>
                                <FontAwesomeIcon icon={faPen} className="text-sm" />
                            </Button>
                        </div>
                    </div>
                    <div className="mt-4">
                        {MENU_ITEMS.map((item: MenuItemType, index: number) => (
                            <React.Fragment key={index}>
                                <MenuItem item={item} onChoose={handleChoose} />
                            </React.Fragment>
                        ))}
                    </div>
                </section>
            </PopperWrapper>
        )
    }

    return (
        <div className="flex items-center gap-4">
            <>
                <Notification />
                <Tippy content="Messenger">
                    <div>
                        <Button buttonType="icon" href={config.routes.dashboard}>
                            <MessageIcon />
                        </Button>
                    </div>
                </Tippy>
            </>
            <CustomTippy
                trigger="click"
                renderItem={renderTooltip}
                placement="bottom-start"
                offsetY={10}
                timeDelayOpen={50}
                timeDelayClose={250}
            >
                <div>
                    <UserAvatar src={currentUser?.data?.avatar} className="w-[32px] sm:w-[36px]" />
                </div>
            </CustomTippy>
        </div>
    )
}

export default Interaction
