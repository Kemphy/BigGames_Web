import { apiClient } from "./api"
import type { Reservation } from "../types/api"

export interface AdminReservation extends Reservation {
  user_name?: string
  user_email?: string
  room_name: string | null
  payment_status: string | null
  payment_method: string | null
}

export interface Payment {
  id: string
  reservation_id: string
  method: string
  status: string
  amount: string
  proof_url: string | null
  reference: string | null
  created_at: string
  confirmed_at: string | null
  confirmed_by_admin_id: string | null
}

class AdminService {
  // ============ RESERVATIONS ============
  
  async getAllReservations(params?: { status?: string }): Promise<AdminReservation[]> {
    return apiClient.get<AdminReservation[]>('/api/admin/reservations', params)
  }

  async updateReservationStatus(
    reservationId: string,
    status: string
  ): Promise<Reservation> {
    return apiClient.put(`/api/admin/reservations/${reservationId}/status`, { status })
  }

  // ============ PAYMENTS ============
  
  async getAllPayments(): Promise<Payment[]> {
    return apiClient.get<Payment[]>('/api/admin/payments')
  }

  async confirmPayment(
    paymentId: string,
    reference?: string
  ): Promise<Payment> {
    return apiClient.put(`/api/admin/payments/${paymentId}/confirm`, 
      reference ? { reference } : {}
    )
  }

  async rejectPayment(paymentId: string): Promise<Payment> {
    return apiClient.put(`/api/admin/payments/${paymentId}/reject`)
  }
}

export const adminService = new AdminService()
