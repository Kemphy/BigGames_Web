import { apiClient } from './api'
import type { Payment } from '../types/api'

export const paymentService = {
  async uploadProof(reservationId: string, proofUrl: string, reference?: string): Promise<any> {
    // Correct endpoint from backend docs: /api/reservations/{id}/payment-proof
    return apiClient.post(`/api/reservations/${reservationId}/payment-proof`, {
      proof_url: proofUrl,
      reference
    })
  },

  async getPaymentInstructions(reservationId: string): Promise<any> {
    // Get payment instructions from backend
    return apiClient.get(`/api/reservations/${reservationId}/payment-instructions`)
  },

  getPaymentInfo() {
    // Fallback static info
    return {
      qris_url: 'https://example.com/qris-biggames.png',
      bank_name: 'BCA',
      bank_account: '1234567890',
      bank_account_name: 'BIG GAMES Online Booking'
    }
  }
}
