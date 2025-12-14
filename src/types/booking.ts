export type ConsoleType = {
  id: string
  name: string
  category: "VIP" | "REGULER"
  pricePerHour: number
  image: string
  description: string
}

export type BookingStatus = "PENDING" | "PAID" | "COMPLETED"

export type Booking = {
  id: string
  consoleId: string
  consoleName: string
  date: string
  startTime: string
  duration: number
  totalPrice: number
  createdAt: string
  status: BookingStatus
  userName?: string
}
