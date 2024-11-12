import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'

interface ThemeState {
    theme: 'light' | 'dark'
    toggleTheme: () => void
    setTheme: (theme: 'light' | 'dark') => void
}

const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'light',
            toggleTheme: () =>
                set((state) => ({
                    theme: state.theme === 'light' ? 'dark' : 'light',
                })),
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: 'theme-storage',
        } as PersistOptions<ThemeState>,
    ),
)

export default useThemeStore
