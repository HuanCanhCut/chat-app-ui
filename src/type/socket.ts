import {
    BlockModel,
    ConversationMember,
    ConversationModel,
    ConversationThemeModel,
    MessageModel,
    MessageReactionModel,
    UserModel,
} from './type'

interface ServerToClientEvents {
    // ------------------------------- MESSAGE -------------------------------
    NEW_MESSAGE: ({ conversation }: { conversation: ConversationModel }) => void
    UPDATE_READ_MESSAGE: ({
        message,
        user_read_id,
        conversation_uuid,
    }: {
        message: MessageModel
        user_read_id: number
        conversation_uuid: string
    }) => void

    REACT_MESSAGE: ({
        reaction,
        top_reactions,
        total_reactions,
    }: {
        reaction: MessageReactionModel | null
        top_reactions: MessageReactionModel[]
        total_reactions: number
    }) => void

    REMOVE_REACTION: ({
        message_id,
        react,
        top_reactions,
        total_reactions,
    }: {
        message_id: number
        react: string
        top_reactions: MessageReactionModel[]
        total_reactions: number
    }) => void

    MESSAGE_TYPING: ({
        conversation_uuid,
        user_id,
        is_typing,
    }: {
        conversation_uuid: string
        user_id: number
        is_typing: boolean
    }) => void

    MESSAGE_REVOKE: ({ message_id, conversation_uuid }: { message_id: number; conversation_uuid: string }) => void

    // ------------------------------- User Status -------------------------------
    USER_STATUS: ({
        user_id,
        is_online,
        last_online_at,
    }: {
        user_id: number
        is_online: boolean
        last_online_at: string | null
    }) => void

    // ------------------------------- Call -------------------------------
    CALL_BUSY: () => void
    INITIATE_CALL: ({ caller, type, uuid }: { caller: UserModel; type: 'video' | 'voice'; uuid: string }) => void
    CANCEL_INCOMING_CALL: ({ caller_id }: { caller_id: number }) => void
    ACCEPTED_CALL: ({ peer_id }: { peer_id: string }) => void
    END_CALL: ({ caller_id, callee_id }: { caller_id: number; callee_id: number }) => void
    RENEGOTIATION_OFFER: ({
        from_user_id,
        caller_id,
        callee_id,
        offer,
    }: {
        from_user_id: number
        caller_id: number
        callee_id: number
        offer: RTCSessionDescriptionInit
    }) => void

    RENEGOTIATION_ANSWER: ({
        from_user_id,
        caller_id,
        callee_id,
        answer,
    }: {
        from_user_id: number
        caller_id: number
        callee_id: number
        answer: RTCSessionDescriptionInit
    }) => void

    REJECT_CALL: ({ caller_id }: { caller_id: number }) => void

    // ------------------------------- Conversation -------------------------------

    CONVERSATION_RENAMED: ({
        conversation_uuid,
        key,
        value,
    }: {
        conversation_uuid: string
        key: string
        value: string
    }) => void

    CONVERSATION_AVATAR_CHANGED: ({
        conversation_uuid,
        key,
        value,
    }: {
        conversation_uuid: string
        key: string
        value: string
    }) => void

    CONVERSATION_THEME_CHANGED: ({
        conversation_uuid,
        key,
        value,
    }: {
        conversation_uuid: string
        key: string
        value: ConversationThemeModel
    }) => void

    CONVERSATION_EMOJI_CHANGED: ({
        conversation_uuid,
        key,
        value,
    }: {
        conversation_uuid: string
        key: string
        value?: string
    }) => void

    CONVERSATION_MEMBER_NICKNAME_CHANGED: ({
        conversation_uuid,
        user_id,
        key,
        value,
    }: {
        conversation_uuid: string
        user_id: number
        key: string
        value: string
    }) => void

    CONVERSATION_MEMBER_ADDED: ({
        conversation_uuid,
        members,
    }: {
        conversation_uuid: string
        members: ConversationMember[]
    }) => void

    CONVERSATION_MEMBER_JOINED: () => void

    CONVERSATION_LEADER_CHANGED: ({
        conversation_uuid,
        user_id,
        key,
        value,
    }: {
        conversation_uuid: string
        user_id: number
        key: string
        value: string
    }) => void

    CONVERSATION_MEMBER_REMOVED: ({
        conversation_uuid,
        member_id,
    }: {
        conversation_uuid: string
        member_id: number
    }) => void

    CONVERSATION_MEMBER_LEAVED: ({
        conversation_uuid,
        member_id,
    }: {
        conversation_uuid: string
        member_id?: number
    }) => void

    CONVERSATION_BLOCKED: ({
        conversation_uuid,
        key,
        value,
    }: {
        conversation_uuid: string
        key: string
        value: BlockModel | null
    }) => void

    CONVERSATION_UNBLOCKED: ({
        conversation_uuid,
        key,
        value,
    }: {
        conversation_uuid: string
        key: string
        value: BlockModel | null
    }) => void

    NEW_CONVERSATION: (conversation: ConversationModel) => void

    // ------------------------------- Notification -------------------------------
    NEW_NOTIFICATION: ({
        notification,
    }: {
        notification: {
            sender_id: number
            sender_user: UserModel
            id?: number
            type: 'friend_request' | 'accept_friend_request' | 'message'
            recipient_id: number
            message: string
            is_read?: boolean
            is_seen?: boolean
            created_at?: Date
            updated_at?: Date
        }
    }) => void

    REMOVE_NOTIFICATION: ({ notification_id }: { notification_id?: number }) => void
}

interface ClientToServerEvents {
    // ------------------------------- MESSAGE -------------------------------
    NEW_MESSAGE: ({
        conversation_uuid,
        message,
        type,
        parent_id,
    }: {
        conversation_uuid: string
        message: string
        type: string
        parent_id?: number | null
    }) => void

    READ_MESSAGE: ({ conversation_uuid, message_id }: { conversation_uuid: string; message_id: number }) => void

    REACT_MESSAGE: ({
        conversation_uuid,
        message_id,
        react,
        user_react_id,
    }: {
        conversation_uuid: string
        message_id: number
        react: string
        user_react_id: number
    }) => void

    REMOVE_REACTION: ({
        conversation_uuid,
        message_id,
        user_reaction_id,
        react,
    }: {
        conversation_uuid: string
        message_id: number
        user_reaction_id: number
        react: string
    }) => void

    MESSAGE_TYPING: ({
        conversation_uuid,
        user_id,
        is_typing,
    }: {
        conversation_uuid: string
        user_id: number
        is_typing: boolean
    }) => void

    // ------------------------------- Conversation -------------------------------
    JOIN_ROOM: (conversation_uuid: string) => void
    LEAVE_ROOM: ({ conversation_uuid, user_id }: { conversation_uuid: string; user_id?: number }) => void

    // ------------------------------- CALL ---------------------------------------
    INITIATE_CALL: ({
        callee_id,
        caller_id,
        type,
        uuid,
    }: {
        callee_id?: number
        caller_id: number
        type: 'video' | 'voice'
        uuid: string | null
    }) => void

    ACCEPTED_CALL: ({
        caller_id,
        peer_id,
        callee_id,
        uuid,
    }: {
        caller_id?: number
        peer_id: string
        callee_id?: number
        uuid: string | null
    }) => void

    END_CALL: ({ caller_id, callee_id, uuid }: { caller_id: number; callee_id?: number; uuid: string | null }) => void

    RENEGOTIATION_OFFER: ({
        from_user_id,
        to_user_id,
        caller_id,
        callee_id,
        offer,
    }: {
        from_user_id: number
        to_user_id?: number
        caller_id?: number
        callee_id?: number
        offer: RTCSessionDescriptionInit
    }) => void

    RENEGOTIATION_ANSWER: ({
        from_user_id,
        to_user_id,
        caller_id,
        callee_id,
        answer,
    }: {
        from_user_id: number
        to_user_id: number
        caller_id: number
        callee_id: number
        answer: RTCSessionDescriptionInit
    }) => void
    REJECT_CALL: ({ caller_id }: { caller_id?: number }) => void

    // ------------------------------- User Status -------------------------------
    VISIBILITY_CHANGE: ({ is_visible }: { is_visible: boolean }) => void
}

interface InterServerEvents {
    ping: () => void
}

export type { ClientToServerEvents, InterServerEvents, ServerToClientEvents }
