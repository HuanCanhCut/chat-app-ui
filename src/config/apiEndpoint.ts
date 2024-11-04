export const apiEndpoint = {
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        loginWithToken: '/auth/loginwithtoken',
        verify: '/auth/verify',
        resetPassword: '/auth/reset-password',
    },
    user: {
        getAnUser: '/users/',
    },
    friend: {
        getAllFriends: '/friends',
        getFriendInvitation: '/friend-invitation',
        addFriend: '/users/:id/add',
        acceptFriend: '/users/:id/accept',
        rejectFriend: '/users/:id/reject',
        unfriend: '/users/:id/unfriend',
        cancelFriendRequest: '/users/:id/cancel',
    },
    me: {
        getCurrentUser: '/me',
        updateCurrentUser: '/me/update',
    },
    notification: {
        getNotifications: '/notifications',
    },
}
