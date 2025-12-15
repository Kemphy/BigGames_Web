export interface User {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN' | 'FINANCE'
  created_at: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface Room {
  id: string
  name: string
  description: string
  category: 'PS4' | 'PS5' | 'PC' | 'VIP' | 'REGULAR' | 'REGULER' | 'SIMULATOR' // Support both old and new categories
  capacity: number
  base_price_per_hour: string | number // Support both formats for compatibility
  status: 'ACTIVE' | 'INACTIVE'
  created_at: string
  images: string[]
  units: RoomUnit[]
  avg_rating?: number
  review_count?: number
}

export interface RoomUnit {
  id: string
  console_type: 'PS4_SLIM' | 'PS4_PRO' | 'PS5_SLIM' | 'PS5_PRO' | 'NINTENDO_SWITCH'
  jumlah_stick: number
  status: 'ACTIVE' | 'MAINTENANCE'
}

export interface TimeSlot {
  start_hour: number
  end_hour: number
  start_time: string
  end_time: string
  is_available: boolean
  status: 'available' | 'booked'
}

export interface RoomSlots {
  room_id: string
  room_name: string
  date: string
  opening_hour: number
  closing_hour: number
  slots: TimeSlot[]
}

export interface AllSlotsResponse {
  date: string
  rooms: RoomSlots[]
}

export interface Reservation {
  id: string
  user_id: string
  room_id: string
  room?: Room  // Optional - backend might not always include this
  user?: {
    id: string
    name: string
    email: string
  }
  start_time: string
  end_time: string
  duration_hours: string
  subtotal: string
  discount_amount: string
  total_amount: string
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'WAITING_CONFIRMATION' | 'REJECTED'
  created_at: string
  payment?: Payment
}

export interface Payment {
  id: string
  status: 'WAITING_CONFIRMATION' | 'CONFIRMED' | 'REJECTED'
  amount: string
  payment_proof_url?: string
  proof_url?: string
  reference?: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  category: 'FOOD' | 'DRINK' | 'SNACK'
  price: string
  stock: number
  is_active: boolean
  image_url?: string
}

export interface Promo {
  id: string
  code: string
  discount_type: 'PERCENT' | 'FIXED'
  discount_value: string
  start_date: string
  end_date: string
  is_active: boolean
}

export interface Review {
  id: string
  user: { name: string }
  rating: number
  comment: string
  created_at: string
}
