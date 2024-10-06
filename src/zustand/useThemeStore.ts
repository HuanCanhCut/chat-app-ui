// src/store/useThemeStore.ts
import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'

interface ThemeState {
    theme: 'light' | 'dark'
    toggleTheme: () => void
    setTheme: (theme: 'light' | 'dark') => void
}

// Tạo store với TypeScript
const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'light', // Mặc định là 'light'
            toggleTheme: () =>
                set((state) => ({
                    theme: state.theme === 'light' ? 'dark' : 'light',
                })),
            setTheme: (theme) => set({ theme }), // Set theme thủ công
        }),
        {
            name: 'theme-storage', // Tên key để lưu vào localStorage
        } as PersistOptions<ThemeState>, // Chỉ định kiểu cho PersistOptions
    ),
)

export default useThemeStore
