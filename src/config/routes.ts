interface Routes {
    home: string
    user: string
    auth: string
    message: string
    create_story: string
    not_found: string
    stories: string
}

export const routes: Routes = {
    home: '/',
    user: '/user',
    auth: '/auth',
    message: '/message',
    create_story: '/stories/create',
    not_found: '/not-found',
    stories: '/stories/:uuid',
}
