interface Routes {
    home: string
    user: string
    user_friends: string
    auth: string
    message: string
    create_story: string
    not_found: string
    stories: string
    user_friends_invite: string
}

export const routes: Routes = {
    home: '/',
    user: '/user',
    user_friends: '/user/:nickname/friends',
    auth: '/auth',
    message: '/message',
    create_story: '/stories/create',
    not_found: '/not-found',
    stories: '/stories/:uuid',
    user_friends_invite: '/user/:nickname/friends/invite',
}
