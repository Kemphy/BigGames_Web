export interface MenuItem {
  id: string
  name: string
  description: string | null
  price: string
  image_url: string | null
  category: "FOOD" | "DRINK" | "SNACK"
  stock: number
  is_active: boolean
  rating?: number
  free_delivery?: boolean
}

export interface CartItem {
  menu_item: MenuItem
  quantity: number
}

export interface FoodOrder {
  id: string
  user_id: string
  user_name?: string
  reservation_id?: string
  room_id?: string
  room_name?: string
  status: FoodOrderStatus
  notes?: string
  subtotal: string
  delivery_fee: string
  total_amount: string
  created_at: string
  items: FoodOrderItem[]
}

export interface FoodOrderItem {
  id: string
  menu_item_id: string
  menu_item_name?: string
  qty: number
  price: string
  subtotal: string
}

export type FoodOrderStatus = 
  | "PENDING" 
  | "COOKING" 
  | "DELIVERING" 
  | "COMPLETED" 
  | "CANCELLED"
