import api from './api'
import type { AuthResponse, LoginPayload, RegisterPayload, UpdateProfilePayload, User } from '../types/user'

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', payload)
    return response.data
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', payload)
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getMe(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/me')
    return response.data.user
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await api.put<{ user: User }>('/auth/profile', payload)
    return response.data.user
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/change-password', { currentPassword, newPassword })
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password })
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token })
  },

  async uploadAvatar(file: File): Promise<{ avatar: string }> {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await api.post<{ avatar: string }>('/auth/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}
