export enum SocketEvent {
    // ------------------------------- Chat -------------------------------
    JOIN_ROOM = 'room:join',
    NEW_MESSAGE = 'message:new',
    READ_MESSAGE = 'message:read',
    UPDATE_READ_MESSAGE = 'message:update_read',
    USER_STATUS = 'user:status',
    USER_OFFLINE_TIMER = 'user:offline_timer',
    MESSAGE_REVOKE = 'message:revoke',

    // ------------------------------- Notification -------------------------------
    NEW_NOTIFICATION = 'notification:new',
    REMOVE_NOTIFICATION = 'notification:remove',

    // ------------------------------- Reaction -------------------------------
    REACT_MESSAGE = 'message:react',
    REMOVE_REACTION = 'message:remove_reaction',
}
