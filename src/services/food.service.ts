import { apiClient } from "./api"
import type { MenuItem, FoodOrder } from "../types/food"

interface MenuResponse {
  items: MenuItem[]
  total: number
  page: number
  page_size: number
}

interface CreateOrderRequest {
  reservation_id?: string
  room_id?: string
  notes?: string
  items: {
    menu_item_id: string
    qty: number
  }[]
}

class FoodService {
  // Get menu items
  async getMenuItems(params?: {
    category?: string
  }): Promise<MenuItem[]> {
    return apiClient.get<MenuItem[]>('/api/menu-items', params)
  }

  // Create food order
  async createOrder(data: CreateOrderRequest): Promise<FoodOrder> {
    return apiClient.post<FoodOrder>('/api/fb/orders', data)
  }

  // Get my orders
  async getMyOrders(): Promise<FoodOrder[]> {
    return apiClient.get<FoodOrder[]>('/api/fb/orders/me')
  }

  // Cancel order (preserves order history)
  async cancelOrder(orderId: string): Promise<void> {
    return apiClient.post(`/api/fb/orders/${orderId}/cancel`, {})
  }

  // Admin: Get all orders
  async getAllOrders(params?: {
    status?: string
  }): Promise<FoodOrder[]> {
    return apiClient.get<FoodOrder[]>('/api/admin/fb/orders', params)
  }

  // Admin: Update order status
  async updateOrderStatus(orderId: string, status: string): Promise<FoodOrder> {
    return apiClient.post<FoodOrder>(`/api/admin/fb/orders/${orderId}/status`, { status })
  }
}

export const foodService = new FoodService()
