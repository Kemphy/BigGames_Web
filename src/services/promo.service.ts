import { apiClient } from './api'
import type { Promo } from '../types/api'

export const promoService = {
  async getActivePromos(): Promise<{ promos: Promo[] }> {
    return apiClient.get<{ promos: Promo[] }>('/api/promos')
  },

  async validatePromo(code: string, subtotal: number): Promise<{
    valid: boolean
    promo?: Promo
    discount_amount?: number
  }> {
    return apiClient.post('/api/promos/validate', { code, subtotal })
  }
}
