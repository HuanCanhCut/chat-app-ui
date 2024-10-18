interface Routes<T> {
    [key: string]: T
}

export const routes: Routes<string> = {
    home: '/',
    user: '/user/',
    login: '/login',
    dashboard: '/dashboard',
}
