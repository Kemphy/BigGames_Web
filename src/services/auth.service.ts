import { apiClient } from './api'
import type { User, LoginResponse } from '../types/api'

export const authService = {
  async register(email: string, password: string, name: string): Promise<User> {
    return apiClient.post<User>('/api/auth/register', { email, password, name })
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', { email, password })
    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('refresh_token', response.refresh_token)
    return response
  },

  async getProfile(): Promise<User> {
    return apiClient.get<User>('/api/auth/me')
  },

  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) throw new Error('No refresh token')
    
    const response = await apiClient.post<LoginResponse>('/api/auth/refresh', { 
      refresh_token: refreshToken 
    })
    localStorage.setItem('access_token', response.access_token)
    return response
  },

  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}
