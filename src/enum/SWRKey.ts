enum SWRKey {
    SEARCH_HISTORY = '/search-history',

    /**
     * Auth
     */
    LOGIN = '/auth/login',
    REGISTER = '/auth/register',
    LOGOUT = '/auth/logout',
    LOGIN_WITH_TOKEN = '/auth/loginwithtoken',
    VERIFY = '/auth/verify',
    RESET_PASSWORD = '/auth/reset-password',

    /**
     * User
     */
    GET_AN_USER = '/users/',
    GET_CURRENT_USER = '/me',
    UPDATE_CURRENT_USER = '/me/update',

    /**
     * Friend
     */
    GET_ALL_FRIENDS = '/friends',
    GET_FRIEND_INVITATION = '/friend-invitation',
    ADD_FRIEND = '/users/:id/add',
    ACCEPT_FRIEND = '/users/:id/accept',
    REJECT_FRIEND = '/users/:id/reject',
    UNFRIEND = '/users/:id/unfriend',
    CANCEL_FRIEND_REQUEST = '/users/:id/cancel',

    /**
     * Notification
     */
    GET_NOTIFICATIONS = '/notifications',

    /**
     * Conversation
     */
    GET_CONVERSATIONS = '/conversations',
    GET_CONVERSATION_BY_UUID = '/conversations/:uuid',

    /**
     * Message
     */
    GET_MESSAGES = '/messages/:conversationUuid',
    GET_MESSAGE_IMAGES = '/messages/:conversationUuid/images',

    /**
     * Reaction
     */
    GET_REACTIONS_TYPE = '/reactions/:messageId/types',
    GET_REACTIONS = '/reactions/:messageId',
}

export default SWRKey
