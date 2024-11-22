import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'
import { UserResponse } from '~/type/type'

interface CurrentUserState {
    currentUser: UserResponse | null
    dispatch: (currentUser: UserResponse | null) => void
}

const getCurrentUser = create<CurrentUserState>()(
    persist(
        (set) => ({
            currentUser: null,
            dispatch: (currentUser) => set({ currentUser }),
        }),
        {
            name: 'current-user-storage',
        } as PersistOptions<CurrentUserState>,
    ),
)

export default getCurrentUser
