import { apiClient } from './api'
import type { Room, AllSlotsResponse, RoomSlots } from '../types/api'

interface RoomsResponse {
  rooms: Room[]
  total: number
  page: number
  page_size: number
}

export const roomService = {
  async getRooms(params?: {
    category?: string
    minPrice?: number
    maxPrice?: number
    capacity?: number
    page?: number
    pageSize?: number
  }): Promise<RoomsResponse> {
    const queryParams = new URLSearchParams()
    if (params?.category) queryParams.set('category', params.category)
    if (params?.minPrice) queryParams.set('minPrice', params.minPrice.toString())
    if (params?.maxPrice) queryParams.set('maxPrice', params.maxPrice.toString())
    if (params?.capacity) queryParams.set('capacity', params.capacity.toString())
    if (params?.page) queryParams.set('page', params.page.toString())
    if (params?.pageSize) queryParams.set('pageSize', params.pageSize.toString())

    const query = queryParams.toString()
    return apiClient.get<RoomsResponse>(`/api/rooms${query ? `?${query}` : ''}`)
  },

  async getRoomById(id: string): Promise<Room> {
    return apiClient.get<Room>(`/api/rooms/${id}`)
  },

  async getAllTimeSlots(date: string): Promise<AllSlotsResponse> {
    return apiClient.get<AllSlotsResponse>(`/api/rooms/all/slots?date=${date}`)
  },

  async getRoomTimeSlots(roomId: string, date: string): Promise<RoomSlots> {
    return apiClient.get<RoomSlots>(`/api/rooms/${roomId}/slots?date=${date}`)
  },

  async checkAvailability(roomId: string, start: string, end: string): Promise<{
    room_id: string
    start: string
    end: string
    is_available: boolean
    conflicting_reservations: unknown[]
  }> {
    return apiClient.get(`/api/rooms/${roomId}/availability?start=${start}&end=${end}`)
  }
}
