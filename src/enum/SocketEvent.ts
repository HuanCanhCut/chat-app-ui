export enum SocketEvent {
    // ------------------------------- User -------------------------------
    VISIBILITY_CHANGE = 'visibility_change',

    // ------------------------------- MESSAGE -------------------------------
    JOIN_ROOM = 'room:join',
    NEW_MESSAGE = 'message:new',
    READ_MESSAGE = 'message:read',
    UPDATE_READ_MESSAGE = 'message:update_read',
    USER_STATUS = 'user:status',
    MESSAGE_REVOKE = 'message:revoke',
    MESSAGE_TYPING = 'message:typing',

    // ------------------------------- Notification -------------------------------
    NEW_NOTIFICATION = 'notification:new',
    REMOVE_NOTIFICATION = 'notification:remove',

    // ------------------------------- Reaction -------------------------------
    REACT_MESSAGE = 'message:react',
    REMOVE_REACTION = 'message:remove_reaction',

    // ------------------------------- Conversation -------------------------------
    CONVERSATION_RENAMED = 'conversation:renamed',
    CONVERSATION_AVATAR_CHANGED = 'conversation:avatar_changed',
    CONVERSATION_THEME_CHANGED = 'conversation:theme_changed',
    CONVERSATION_EMOJI_CHANGED = 'conversation:emoji_changed',
    CONVERSATION_MEMBER_NICKNAME_CHANGED = 'conversation:member_nickname_changed',
    CONVERSATION_MEMBER_ADDED = 'conversation:member_added',
    CONVERSATION_MEMBER_JOINED = 'conversation:member_joined',
    CONVERSATION_LEADER_CHANGED = 'conversation:leader_changed',
    CONVERSATION_MEMBER_REMOVED = 'conversation:member_removed',
    CONVERSATION_MEMBER_LEAVED = 'conversation:member_leaved',
    CONVERSATION_BLOCKED = 'conversation:blocked',
    LEAVE_ROOM = 'conversation:leave',
}
