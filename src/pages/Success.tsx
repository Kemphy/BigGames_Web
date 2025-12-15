import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { reservationService } from "../services/reservation.service"
import type { Reservation } from "../types/api"

export default function Success() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReservation()
  }, [id])

  const loadReservation = async () => {
    try {
      // First, try to get reservation from navigation state
      if (location.state?.reservation) {
        setReservation(location.state.reservation)
        setLoading(false)
        return
      }

      // Fallback: fetch from API
      const reservations = await reservationService.getMyReservations()
      const found = reservations.find(r => r.id === id)
      
      if (found) {
        setReservation(found)
      }
    } catch (err) {
      console.error("Failed to load reservation:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-2xl text-white/60">Reservation not found</p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const startDate = new Date(reservation.start_time)
  const endDate = new Date(reservation.end_time)

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Success Animation */}
        <div className="text-center animate-in fade-in duration-500">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
              <svg className="w-12 h-12 text-white animate-in slide-in-from-bottom duration-500 delay-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-green-500/20 animate-ping mx-auto"></div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Booking Successful!
          </h1>
          <p className="text-white/60 text-lg">
            Your payment has been confirmed
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="glass-card p-8 space-y-6">
          <div className="text-center pb-4 border-b border-white/10">
            <p className="text-sm text-white/50 mb-1">Booking ID</p>
            <p className="font-mono text-sm text-white/70 select-all">{reservation.id}</p>
          </div>

          {/* Room Info */}
          <div className="text-center pb-6 border-b border-white/10">
            <div className="inline-block px-4 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-semibold mb-3">
              {reservation.room?.category || 'N/A'}
            </div>
            <h2 className="text-2xl font-bold mb-2">{reservation.room?.name || 'Room'}</h2>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-white/50 mb-1">Date</p>
              <p className="font-semibold">
                {startDate.toLocaleDateString('id-ID', { 
                  weekday: 'long',
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-white/50 mb-1">Time</p>
              <p className="font-semibold">
                {startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-white/50 mb-1">Duration</p>
              <p className="font-semibold">{reservation.duration_hours} hours</p>
            </div>
            
            <div>
              <p className="text-sm text-white/50 mb-1">Status</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                <span className="text-sm font-semibold">{reservation.status.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white/5 rounded-xl p-6 space-y-3">
            <div className="flex justify-between text-white/60">
              <span>Subtotal</span>
              <span>Rp {parseFloat(reservation.subtotal).toLocaleString()}</span>
            </div>
            
            {parseFloat(reservation.discount_amount) > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount</span>
                <span>- Rp {parseFloat(reservation.discount_amount).toLocaleString()}</span>
              </div>
            )}
            
            <div className="h-px bg-white/10 my-2" />
            
            <div className="flex justify-between text-2xl font-bold">
              <span>Total Paid</span>
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Rp {parseFloat(reservation.total_amount).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="font-semibold text-blue-400 mb-1">Important Information</p>
                <p className="text-white/70 text-xs">
                  Please arrive 10 minutes before your booking time. Bring your booking ID for check-in. You can view your booking details in your profile.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => navigate("/profile")}
              className="btn-secondary"
            >
              View My Bookings
            </button>
            <button
              onClick={() => navigate("/")}
              className="btn-primary"
            >
              Book Again
            </button>
          </div>
        </div>

        {/* Share Section */}
        <div className="text-center">
          <p className="text-white/50 text-sm mb-4">Share your experience</p>
          <div className="flex justify-center gap-3">
            <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <span className="text-xl">📱</span>
            </button>
            <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <span className="text-xl">📧</span>
            </button>
            <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <span className="text-xl">💬</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
