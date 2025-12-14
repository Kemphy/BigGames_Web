import { useParams, useNavigate } from "react-router-dom"
import { getBookings, updateBookingStatus } from "../services/bookings"
import { useState } from "react"

export default function Payment() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const booking = getBookings().find((b) => b.id === id)

  if (!booking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-white/60">Booking tidak ditemukan</p>
          <button onClick={() => navigate("/")} className="mt-4 btn-primary">
            Kembali ke Home
          </button>
        </div>
      </div>
    )
  }

  function simulatePayment() {
    if (!booking) return
    setLoading(true)

    // Simulasi proses pembayaran - langsung redirect
    updateBookingStatus(booking.id, "PAID")
    
    // Delay sedikit untuk animasi loading
    setTimeout(() => {
      navigate(`/success/${booking.id}`)
    }, 1500)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Pembayaran</h1>
        <p className="text-white/60">Selesaikan pembayaran Anda</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Payment Method */}
        <div className="space-y-6">
          {/* Payment Method */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold mb-4 text-xl">Metode Pembayaran</h3>
            
            {/* QRIS */}
            <div className="bg-white rounded-2xl p-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h8v8H3V3m2 2v4h4V5H5m-2 8h8v8H3v-8m2 2v4h4v-4H5m8-12h8v8h-8V3m2 2v4h4V5h-4m0 8h2v2h-2v-2m2 0h2v2h-2v-2m-2 2h2v2h-2v-2m4-2h2v4h-2v-4m0 4h2v2h-2v-2m-4 0h2v2h-2v-2m2-2h2v2h-2v-2m-2 0h2v2h-2v-2z"/>
                </svg>
                <h4 className="text-lg font-bold text-gray-800">QRIS Payment</h4>
              </div>
              
              {/* QR Code Placeholder */}
              <div className="bg-gradient-to-br from-purple-100 to-cyan-100 rounded-xl p-8 mx-auto max-w-[280px] aspect-square flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-40 h-40 text-purple-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h8v8H3V3m2 2v4h4V5H5m-2 8h8v8H3v-8m2 2v4h4v-4H5m8-12h8v8h-8V3m2 2v4h4V5h-4m0 8h2v2h-2v-2m2 0h2v2h-2v-2m-2 2h2v2h-2v-2m4-2h2v4h-2v-4m0 4h2v2h-2v-2m-4 0h2v2h-2v-2m2-2h2v2h-2v-2m-2 0h2v2h-2v-2z"/>
                  </svg>
                  <p className="text-sm text-gray-600 font-medium">Scan untuk membayar</p>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>Scan QR code menggunakan aplikasi mobile banking</p>
                <p className="font-semibold">atau e-wallet Anda</p>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-sm text-blue-400 font-medium mb-2">ℹ️ Cara Pembayaran:</p>
              <ol className="text-xs text-blue-300/80 space-y-1 list-decimal list-inside">
                <li>Buka aplikasi mobile banking atau e-wallet</li>
                <li>Pilih menu QRIS atau Scan QR</li>
                <li>Arahkan kamera ke QR code di atas</li>
                <li>Konfirmasi pembayaran</li>
              </ol>
            </div>

            {/* Action Button */}
            <button
              onClick={simulatePayment}
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Memverifikasi Pembayaran...
                </span>
              ) : (
                "Saya Sudah Bayar"
              )}
            </button>

            <p className="text-center text-xs text-white/40">
              *Prototype: Klik tombol untuk simulasi pembayaran berhasil
            </p>
          </div>
        </div>

        {/* Right Column - Booking Summary */}
        <div className="glass-card p-6 space-y-6 lg:sticky lg:top-24 h-fit">
          <h3 className="font-semibold text-xl">Ringkasan Pesanan</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-white/60 mb-1">Ruangan</p>
              <p className="font-bold text-lg">{booking.consoleName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-white/60 mb-1">Tanggal</p>
                <p className="font-semibold">{booking.date}</p>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-1">Waktu</p>
                <p className="font-semibold">{booking.startTime || "-"}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-white/60 mb-1">Durasi</p>
              <p className="font-semibold">{booking.duration} jam</p>
            </div>

            {booking.userName && (
              <div>
                <p className="text-sm text-white/60 mb-1">Atas Nama</p>
                <p className="font-semibold">{booking.userName}</p>
              </div>
            )}

            <div className="h-px bg-white/10" />

            <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl p-4">
              <p className="text-sm text-white/60 mb-1">Total Pembayaran</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Rp {booking.totalPrice.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
