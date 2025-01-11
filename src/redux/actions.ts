export const setCurrentUser = (payload: any) => {
    return {
        type: 'set-current-user',
        payload,
    }
}

export const setTheme = (payload: 'light' | 'dark') => {
    localStorage.setItem('theme', JSON.stringify(payload))
    return {
        type: 'set-theme',
        payload,
    }
}
