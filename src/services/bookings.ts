import { Booking } from "../types/booking"

const STORAGE_KEY = "biggames_bookings"

export function getBookings(): Booking[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveBooking(booking: Booking) {
  const bookings = getBookings()
  bookings.push(booking)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
}

export function updateBookingStatus(bookingId: string, status: Booking["status"]) {
  const bookings = getBookings()
  const idx = bookings.findIndex((b) => b.id === bookingId)
  if (idx === -1) return

  bookings[idx].status = status
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
}
