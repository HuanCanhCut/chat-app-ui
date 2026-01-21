import { MessageModel, UserModel } from './type'

interface AppEvents {
    'ADD_MEMBER:PREVIEW': { previewMember: UserModel[] }
    'TIPPY:TIPPY-HIDDEN': { detail: boolean }
    'FRIEND:CHANGE-FRIEND-STATUS': {
        sent_friend_request?: boolean
        is_friend?: boolean
        friend_request?: boolean
    }
    'FRIEND:GET-NEW-FRIENDS': { userId: number }
    'CONVERSATION:LEAVE-GROUP': { conversation_uuid: string }
    'NOTIFICATION:DELETE-NOTIFICATION': { notificationId: number }
    'NOTIFICATION:UPDATE-READ-STATUS': { notificationId: number; type: 'read' | 'unread' }
    'TIPPY:HIDE-SEARCH-MODAL': null
    'USER:STATUS': { user_id: number; is_online: boolean; last_online_at: Date }
    'INFO:TOGGLE': { isOpen: boolean }
    'CONVERSATION:LEAVE-CHOOSE': { type: 'leave_group' }
    'TIPPY:HIDE': null
    'MESSAGE:SCROLL-TO-MESSAGE': { parentMessage: MessageModel; type: 'search' | 'reply' }
    'MESSAGE:SEND': null
    'MESSAGE:ENTER-MESSAGE': { conversationUuid: string }
    'MESSAGE:READ-MESSAGE': { conversationUuid: string }
    'MESSAGE:REPLY': { message: MessageModel }
    'CONVERSATION:OPEN-MODAL': { type: 'theme' }
}

export type { AppEvents }
