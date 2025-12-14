import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { Booking } from "../types/booking"
import { getBookings } from "../services/bookings"

type BookingContextType = {
  bookings: Booking[]
  refresh: () => void
}

const BookingContext = createContext<BookingContextType | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([])

  function refresh() {
    setBookings(getBookings())
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <BookingContext.Provider value={{ bookings, refresh }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBookings() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error("useBookings must be used inside BookingProvider")
  return ctx
}
