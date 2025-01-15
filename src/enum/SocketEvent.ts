export enum SocketEvent {
    // ------------------------------- Chat -------------------------------
    JOIN_ROOM = 'room:join',
    NEW_MESSAGE = 'message:new',
    READ_MESSAGE = 'message:read',
    UPDATE_READ_MESSAGE = 'message:update_read',
    USER_STATUS = 'user:status',
    USER_OFFLINE_TIMER = 'user:offline_timer',

    // ------------------------------- Notification -------------------------------
    NEW_NOTIFICATION = 'notification:new',
    REMOVE_NOTIFICATION = 'notification:remove',
}
