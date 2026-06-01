import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/authService'
import type { User, LoginPayload, RegisterPayload } from '../types/user'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  updateUser: (data: Partial<User>) => void
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const payload: LoginPayload = { email, password }
          const response = await authService.login(payload)
          localStorage.setItem('houseos_token', response.token)
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } }
          set({
            isLoading: false,
            error: error.response?.data?.message ?? 'Login failed',
            isAuthenticated: false,
          })
          throw err
        }
      },

      register: async (data: RegisterPayload) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.register(data)
          localStorage.setItem('houseos_token', response.token)
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } }
          set({
            isLoading: false,
            error: error.response?.data?.message ?? 'Registration failed',
            isAuthenticated: false,
          })
          throw err
        }
      },

      logout: async () => {
        try {
          await authService.logout()
        } catch {
          // ignore error
        } finally {
          localStorage.removeItem('houseos_token')
          localStorage.removeItem('houseos_user')
          set({ user: null, token: null, isAuthenticated: false, error: null })
        }
      },

      updateUser: (data: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...data } })
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('houseos_token')
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null })
          return
        }
        set({ isLoading: true })
        try {
          const user = await authService.getMe()
          set({ user, token, isAuthenticated: true, isLoading: false })
        } catch {
          localStorage.removeItem('houseos_token')
          set({ user: null, token: null, isAuthenticated: false, isLoading: false })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'houseos-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
