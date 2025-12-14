import { apiClient } from './api'
import type { Payment } from '../types/api'

export const paymentService = {
  async uploadProof(paymentId: string, proofUrl: string, reference?: string): Promise<Payment> {
    return apiClient.put<Payment>(`/api/payments/${paymentId}/upload`, {
      proof_url: proofUrl,
      reference
    })
  },

  getPaymentInfo() {
    return {
      qris_url: 'https://example.com/qris-biggames.png',
      bank_name: 'BCA',
      bank_account: '1234567890',
      bank_account_name: 'BIG GAMES Online Booking'
    }
  }
}
