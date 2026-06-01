import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import type { RegisterPayload } from '../types/user'

export const useAuth = () => {
  const navigate = useNavigate()
  const { user, token, isLoading, isAuthenticated, error, login, register, logout, clearError } =
    useAuthStore()

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      try {
        await login(email, password)
        toast.success('Welcome back!')
        navigate('/dashboard')
      } catch {
        // error is already set in the store
      }
    },
    [login, navigate],
  )

  const handleRegister = useCallback(
    async (data: RegisterPayload) => {
      try {
        await register(data)
        toast.success('Account created successfully!')
        navigate('/dashboard')
      } catch {
        // error is already set in the store
      }
    },
    [register, navigate],
  )

  const handleLogout = useCallback(async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }, [logout, navigate])

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    error,
    handleLogin,
    handleRegister,
    handleLogout,
    clearError,
    isAdmin: user?.role === 'admin',
    isArchitect: user?.role === 'architect',
  }
}
