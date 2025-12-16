import { apiClient } from './api'
import type { Reservation } from '../types/api'

interface CreateReservationRequest {
  room_id: string
  start_time: string
  end_time: string
  promo_code?: string
  addon_ids?: string[]
}

export const reservationService = {
  async createReservation(data: CreateReservationRequest): Promise<Reservation> {
    return apiClient.post<Reservation>('/api/reservations', data)
  },

  async getMyReservations(params?: {
    status?: string
    page?: number
    pageSize?: number
  }): Promise<Reservation[]> {
    // Correct endpoint: /me not /my (verified with backend team)
    // Backend returns array directly, not wrapped in object
    return apiClient.get<Reservation[]>('/api/reservations/me', params)
  },

  async cancelReservation(id: string): Promise<{ message: string }> {
    return apiClient.post(`/api/reservations/${id}/cancel`, {})
  }
}
