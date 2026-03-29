import { createSlice } from '@reduxjs/toolkit'

const initialState: {
    theme: 'light' | 'dark'
} = {
    theme: 'light',
}

export const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setTheme(state, { payload }: { payload: 'light' | 'dark' }) {
            localStorage.setItem('theme', JSON.stringify(payload))

            state.theme = payload
        },
    },
})

// Action creators are generated for each case reducer function
export const { setTheme } = themeSlice.actions

export default themeSlice.reducer
