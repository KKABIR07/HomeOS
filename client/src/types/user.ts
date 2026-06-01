export type UserRole = 'homeowner' | 'architect' | 'builder' | 'admin' | 'user'
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due'

export interface Subscription {
  plan: SubscriptionPlan
  status: SubscriptionStatus
  expiresAt: string | null
  aiGenerationsUsed: number
  aiGenerationsLimit: number
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  projectUpdates: boolean
  marketingEmails: boolean
}

export interface UserAddress {
  street?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
}

export interface User {
  id: string
  _id?: string
  name: string
  email: string
  role: UserRole
  avatar: string | null
  phone: string | null
  location: string | null
  bio: string | null
  address?: UserAddress
  subscription: Subscription
  notifications: NotificationSettings
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role?: UserRole
}

export interface UpdateProfilePayload {
  name?: string
  phone?: string
  location?: string
  bio?: string
  avatar?: string
}
