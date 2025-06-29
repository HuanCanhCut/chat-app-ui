import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

import AccountOptions from './AccountOptions'
import {
    faArrowLeft,
    faArrowRightFromBracket,
    faCircleMinus,
    faEllipsis,
    faLink,
    faMagnifyingGlass,
    faPen,
    faUser,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@tippyjs/react'
import Accordion from '~/components/Accordion'
import Button from '~/components/Button'
import CustomTippy from '~/components/CustomTippy'
import { FontIcon, GalleryImageIcon } from '~/components/Icons'
import UserAvatar from '~/components/UserAvatar'
import config from '~/config'
import SWRKey from '~/enum/SWRKey'
import { listenEvent, sendEvent } from '~/helpers/events'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'
import * as conversationServices from '~/services/conversationService'
import { ConversationMember } from '~/type/type'
import { momentTimezone } from '~/utils/moment'

interface ControlPanelProps {
    setSearchMode: Dispatch<SetStateAction<boolean>>
}

interface AccordionItem {
    title: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    description?: string
    type: string
    href?: string
    children?: AccordionItem[]
}

const ControlPanel: React.FC<ControlPanelProps> = ({ setSearchMode }) => {
    const currentUser = useAppSelector(getCurrentUser)
    const { uuid } = useParams()

    const { data: conversation } = useSWR(uuid ? [SWRKey.GET_CONVERSATION_BY_UUID, uuid] : null, () => {
        return conversationServices.getConversationByUuid({ uuid: uuid as string })
    })

    const member = conversation?.data.members.find((member) => {
        return member.user_id !== currentUser?.data.id
    }) as ConversationMember

    const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(member.user.last_online_at)

    const memberMap = useMemo(() => {
        const member: ConversationMember[] = conversation?.data.members || []

        return member.reduce(
            (mem, cur) => {
                mem[cur.user_id] = cur
                return mem
            },
            {} as Record<number, ConversationMember>,
        )
    }, [conversation])

    const handleToggleInfo = useCallback(() => {
        sendEvent({
            eventName: 'info:toggle',
            detail: {
                isOpen: false,
            },
        })
    }, [])

    const ACCORDION_DATA: AccordionItem[] = [
        {
            title: 'Tùy chỉnh đoạn chat',
            type: 'custom_conversation',
            children: [
                conversation?.data.is_group
                    ? {
                          title: 'Đổi tên đoạn chat',
                          leftIcon: <FontAwesomeIcon icon={faPen} width={20} height={20} />,
                          type: 'rename_conversation',
                      }
                    : null,
                conversation?.data.is_group
                    ? {
                          title: 'Thay đổi ảnh',
                          leftIcon: <GalleryImageIcon />,
                          type: 'change_avatar',
                      }
                    : null,
                {
                    title: 'Đổi chủ đề',
                    leftIcon: (
                        <Image
                            src="https://res.cloudinary.com/dkmwrkngj/image/upload/v1750481947/chat-app/avatar/1-chat-app/avatar.webp"
                            alt="edit"
                            width={16}
                            height={16}
                        />
                    ),
                    type: 'change_topic',
                },
                {
                    title: 'Thay đổi biểu tượng cảm xúc',
                    leftIcon: (
                        <Image
                            src="https://res.cloudinary.com/dkmwrkngj/image/upload/v1750481947/chat-app/avatar/1-chat-app/avatar.webp"
                            alt="edit"
                            width={16}
                            height={16}
                        />
                    ),
                    type: 'change_emoji',
                },
                {
                    title: 'Chỉnh sửa biệt danh',
                    leftIcon: <FontIcon />,
                    type: 'change_nickname',
                },
            ].filter(Boolean) as AccordionItem[],
        },
        conversation?.data.is_group
            ? {
                  title: 'Thành viên trong đoạn chat',
                  type: 'member_in_conversation',
                  children: conversation.data.members.map((member, index) => {
                      const addedBy = () => {
                          if (member.added_by_id === currentUser.data.id) {
                              return 'bạn'
                          }

                          if (member.added_by_id) {
                              return (
                                  memberMap[member.added_by_id].nickname || memberMap[member.added_by_id].user.full_name
                              )
                          }

                          return ''
                      }

                      const descriptionMap = {
                          admin: 'Người tạo nhóm',
                          leader: `Quản trị viên · Do ${addedBy()} thêm`,
                          member: `Do ${addedBy()} thêm`,
                      }

                      return {
                          title: member.nickname || member.user.full_name,
                          leftIcon: (
                              <UserAvatar
                                  src={member.user.avatar}
                                  size={36}
                                  href={`${config.routes.user}/@${member.user.nickname}`}
                              />
                          ),
                          description: descriptionMap[member.role],
                          type: 'member',
                          href: `${config.routes.user}/@${member.user.nickname}`,
                          className:
                              'hover:bg-transparent dark:hover:bg-transparent [&>*[data-right-icon]]:ml-auto cursor-default [&_#accordion-title]:cursor-pointer',
                          rightIcon: (
                              <CustomTippy
                                  renderItem={() => {
                                      return <AccountOptions member={member} />
                                  }}
                              >
                                  <Tippy content="Lựa chọn của thành viên" delay={[350, 0]}>
                                      <div
                                          className="flex-center h-9 w-9 cursor-pointer rounded-full hover:bg-[#99999936] dark:hover:bg-[#333636]"
                                          onClick={(e) => {
                                              e.stopPropagation()
                                              e.preventDefault()
                                          }}
                                      >
                                          <FontAwesomeIcon icon={faEllipsis} />
                                      </div>
                                  </Tippy>
                              </CustomTippy>
                          ),
                      }
                  }),
              }
            : null,
        {
            title: 'File phương tiện, liên kết',
            type: 'media_and_link',
            children: [
                {
                    title: 'File phương tiện',
                    leftIcon: <GalleryImageIcon />,
                    type: 'media',
                },
                {
                    title: 'Liên kết',
                    leftIcon: <FontAwesomeIcon icon={faLink} width={20} height={20} />,
                    type: 'link',
                },
            ],
        },
        {
            title: 'Quyền riêng tư và hỗ trợ',
            type: 'privacy_and_support',
            children: [
                !conversation?.data.is_group
                    ? {
                          title: 'Chặn',
                          leftIcon: <FontAwesomeIcon icon={faCircleMinus} width={20} height={20} />,
                          type: 'block',
                      }
                    : null,
                conversation?.data.is_group
                    ? {
                          title: 'Rời nhóm',
                          leftIcon: <FontAwesomeIcon icon={faArrowRightFromBracket} width={20} height={20} />,
                          type: 'leave_group',
                      }
                    : null,
            ].filter(Boolean),
        },
    ].filter(Boolean) as AccordionItem[]

    const handleChose = useCallback((type: string) => {
        console.log(type)
    }, [])

    useEffect(() => {
        interface UserStatus {
            user_id: number
            is_online: boolean
            last_online_at: Date
        }

        const remove = listenEvent<UserStatus>({
            eventName: 'user:status',
            handler: ({ detail }) => {
                if (detail.user_id === member.user.id) {
                    setLastOnlineTime(detail.last_online_at)
                }
            },
        })

        return remove
    }, [member.user.id])

    return (
        <>
            <Button
                buttonType="icon"
                className="block bg-transparent dark:bg-transparent sm:hidden"
                onClick={handleToggleInfo}
            >
                <FontAwesomeIcon icon={faArrowLeft} />
            </Button>

            <div className="flex flex-col items-center pt-2">
                <UserAvatar
                    size={80}
                    src={conversation?.data.is_group ? conversation?.data.avatar : member.user.avatar}
                    isOnline={member.user.is_online}
                    onlineClassName="h-4 w-4 right-1"
                />

                <Link href={`${config.routes.user}/@${member.user.nickname}`} className="mt-2 hover:underline">
                    <p className="line-clamp-2 w-full text-ellipsis text-center font-medium">
                        {conversation?.data.is_group
                            ? conversation.data.name
                            : member.nickname || member.user.full_name}
                    </p>
                </Link>

                {!conversation?.data.is_group && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {member.user.is_online
                            ? 'Đang hoạt động'
                            : `${lastOnlineTime ? `Hoạt động ${momentTimezone(lastOnlineTime)} trước` : ''}`}
                    </p>
                )}

                <div className="flex-center mt-4 gap-8">
                    <div className="flex flex-col items-center">
                        <Link href={`${config.routes.user}/@${member.user.nickname}`}>
                            <Button buttonType="icon" className="h-8 w-8">
                                <FontAwesomeIcon icon={faUser} />
                            </Button>
                        </Link>
                        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">Trang cá nhân</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <Button buttonType="icon" className="h-8 w-8" onClick={() => setSearchMode(true)}>
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </Button>
                        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">Tìm kiếm</p>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                {ACCORDION_DATA.map((item) => {
                    return <Accordion key={item.title} data={item} onChose={handleChose} />
                })}
            </div>
        </>
    )
}

export default ControlPanel
