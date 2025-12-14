import { useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useBookings } from "../context/BookingContext"
import { getBookings } from "../services/bookings"

export default function Success() {
  const { id } = useParams<{ id: string }>()
  const { refresh } = useBookings()
  const navigate = useNavigate()

  useEffect(() => {
    refresh()
  }, [id, refresh])

  const booking = getBookings().find((b) => b.id === id)

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full space-y-8 text-center">
        {/* Success Icon */}
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-pulse blur-xl opacity-50" />
          <div className="relative bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full w-32 h-32 flex items-center justify-center">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Pembayaran Berhasil!
          </h1>
          <p className="text-white/60">
            Booking Anda telah dikonfirmasi dan siap digunakan
          </p>
        </div>

        {/* Booking Info */}
        {booking && (
          <div className="glass-card p-6 text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-white/60">Ruangan</span>
              <span className="font-semibold">{booking.consoleName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Tanggal</span>
              <span className="font-semibold">{booking.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Waktu</span>
              <span className="font-semibold">{booking.startTime || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Durasi</span>
              <span className="font-semibold">{booking.duration} jam</span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex justify-between text-lg">
              <span className="text-white/60">Total Dibayar</span>
              <span className="font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Rp {booking.totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Link to="/" className="block w-full btn-primary">
            Kembali ke Home
          </Link>
          <button
            onClick={() => navigate("/profile")}
            className="w-full btn-secondary"
          >
            Lihat Riwayat Booking
          </button>
        </div>

        <p className="text-xs text-white/40">
          ID Booking: {id?.slice(0, 8)}...
        </p>
      </div>
    </div>
  )
}
