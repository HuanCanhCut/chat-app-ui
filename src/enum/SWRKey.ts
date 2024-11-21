enum SWRKey {
    SEARCH_HISTORY = '/search-history',
    LOGIN = '/auth/login',
    REGISTER = '/auth/register',
    LOGOUT = '/auth/logout',
    LOGIN_WITH_TOKEN = '/auth/loginwithtoken',
    VERIFY = '/auth/verify',
    RESET_PASSWORD = '/auth/reset-password',
    GET_AN_USER = '/users/',
    GET_ALL_FRIENDS = '/friends',
    GET_FRIEND_INVITATION = '/friend-invitation',
    ADD_FRIEND = '/users/:id/add',
    ACCEPT_FRIEND = '/users/:id/accept',
    REJECT_FRIEND = '/users/:id/reject',
    UNFRIEND = '/users/:id/unfriend',
    CANCEL_FRIEND_REQUEST = '/users/:id/cancel',
    GET_CURRENT_USER = '/me',
    UPDATE_CURRENT_USER = '/me/update',
    GET_NOTIFICATIONS = '/notifications',
}

export default SWRKey
