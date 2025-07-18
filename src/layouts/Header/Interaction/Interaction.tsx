import React from 'react'
import { useRouter } from 'next/navigation'

import MenuItem from '../MenuItem'
import { faCircleDot, faPen, faSignOut } from '@fortawesome/free-solid-svg-icons'
import { faMoon, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@tippyjs/react'
import AccountItem from '~/components/AccountItem'
import Button from '~/components/Button'
import CustomTippy from '~/components/CustomTippy/CustomTippy'
import { MessageIcon } from '~/components/Icons'
import Notification from '~/components/Notification/Notification'
import PopperWrapper from '~/components/PopperWrapper'
import UserAvatar from '~/components/UserAvatar/UserAvatar'
import config from '~/config'
import { sendEvent } from '~/helpers/events'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import * as authService from '~/services/authService'

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
    const currentUser = useAppSelector(getCurrentUser)

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
            <PopperWrapper className="min-w-[320px] max-w-[320px] text-sm">
                <header className="p-2">
                    <h4 className="text-center font-semibold">Tùy chọn</h4>
                </header>
                <section>
                    <div className="border-b border-t border-gray-300 px-5 py-2 dark:border-zinc-700">
                        <label className="text-base font-semibold">Tài khoản</label>
                        <div className="flex max-w-full items-center justify-between gap-2 overflow-hidden">
                            {currentUser && (
                                <AccountItem
                                    user={currentUser?.data}
                                    className="mt-2 w-full"
                                    href={`${config.routes.user}/@${currentUser?.data?.nickname}`}
                                />
                            )}
                            <Button
                                buttonType="icon"
                                className="flex-shrink-0"
                                href={`${config.routes.user}/@${currentUser?.data?.nickname}`}
                            >
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
                        <Button buttonType="icon" href={config.routes.message}>
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
                <div className="flex-shrink-0">
                    <UserAvatar src={currentUser?.data?.avatar} className="w-[32px] sm:w-[36px]" />
                </div>
            </CustomTippy>
        </div>
    )
}

export default Interaction
