import { apiClient } from './api'
import type { Reservation } from '../types/api'

interface CreateReservationRequest {
  room_id: string
  start_time: string
  end_time: string
  promo_code?: string
  addon_ids?: string[]
}

interface ReservationsResponse {
  reservations: Reservation[]
  total: number
  page: number
  page_size: number
}

export const reservationService = {
  async createReservation(data: CreateReservationRequest): Promise<Reservation> {
    return apiClient.post<Reservation>('/api/reservations', data)
  },

  async getMyReservations(params?: {
    status?: string
    page?: number
    pageSize?: number
  }): Promise<ReservationsResponse> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.set('status', params.status)
    if (params?.page) queryParams.set('page', params.page.toString())
    if (params?.pageSize) queryParams.set('pageSize', params.pageSize.toString())

    const query = queryParams.toString()
    return apiClient.get<ReservationsResponse>(`/api/reservations/my${query ? `?${query}` : ''}`)
  },

  async cancelReservation(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/api/reservations/${id}`)
  }
}
