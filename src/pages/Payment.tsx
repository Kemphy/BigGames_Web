import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { reservationService } from "../services/reservation.service"
import { paymentService } from "../services/payment.service"
import type { Reservation } from "../types/api"

export default function Payment() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [proofUrl, setProofUrl] = useState("")
  const [reference, setReference] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    loadReservation()
  }, [id])

  const loadReservation = async () => {
    try {
      let reservationData = null

      // First, try to get reservation from navigation state (passed from booking)
      if (location.state?.reservation) {
        reservationData = location.state.reservation
      } else {
        // Fallback: fetch from API
        const reservations = await reservationService.getMyReservations()
        const found = reservations.find(r => r.id === id)
        
        if (!found) {
          setError("Reservation not found. Please check your profile for booking details.")
          setLoading(false)
          return
        }
        reservationData = found
      }

      // If room data is missing, fetch it
      if (reservationData && !reservationData.room) {
        const { roomService } = await import("../services/room.service")
        const roomData = await roomService.getRoomById(reservationData.room_id)
        reservationData = { ...reservationData, room: roomData }
      }

      setReservation(reservationData)
    } catch (err) {
      console.error("Error loading reservation:", err)
      setError("Failed to load reservation")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!reservation?.payment) return
    
    if (!proofUrl.trim()) {
      setError("Please enter payment proof URL")
      return
    }

    setUploading(true)
    setError("")

    try {
      // Use reservation ID directly (not payment.id)
      await paymentService.uploadProof(
        reservation.id,
        proofUrl,
        reference || undefined
      )

      // Success - navigate to success page
      setTimeout(() => {
        navigate(`/success/${reservation.id}`, {
          state: { reservation }
        })
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload payment proof")
    } finally {
      setUploading(false)
    }
  }

  // Auto-confirm for demo purposes
  const handleDemoConfirm = () => {
    if (!reservation) return
    setUploading(true)
    
    // Simulate payment confirmation
    setTimeout(() => {
      navigate(`/success/${reservation.id}`, {
        state: { reservation }
      })
    }, 1500)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <p className="ml-4 text-slate-400">Loading payment details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-2xl text-red-400">{error}</p>
          <p className="text-slate-400">Reservation ID: {id}</p>
          <button onClick={() => navigate("/profile")} className="btn-primary">
            View My Bookings
          </button>
        </div>
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-2xl text-slate-400">No reservation data</p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const paymentInfo = paymentService.getPaymentInfo()
  const startDate = new Date(reservation.start_time)
  const endDate = new Date(reservation.end_time)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Payment</h1>
        <p className="text-slate-400">Complete your payment</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Payment Method */}
        <div className="space-y-6">
          {/* QRIS Payment */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold mb-4 text-xl text-white">QRIS Payment</h3>
            
            <div className="bg-white rounded-2xl p-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h8v8H3V3m2 2v4h4V5H5m-2 8h8v8H3v-8m2 2v4h4v-4H5m8-12h8v8h-8V3m2 2v4h4V5h-4m0 8h2v2h-2v-2m2 0h2v2h-2v-2m-2 2h2v2h-2v-2m4-2h2v4h-2v-4m0 4h2v2h-2v-2m-4 0h2v2h-2v-2m2-2h2v2h-2v-2m-2 0h2v2h-2v-2z"/>
                </svg>
                <h4 className="text-lg font-bold text-gray-800">Scan to Pay</h4>
              </div>
              
              {/* QR Code Placeholder */}
              <div className="bg-gradient-to-br from-purple-100 to-cyan-100 rounded-xl p-8 mx-auto max-w-[280px] aspect-square flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-40 h-40 text-purple-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h8v8H3V3m2 2v4h4V5H5m-2 8h8v8H3v-8m2 2v4h4v-4H5m8-12h8v8h-8V3m2 2v4h4V5h-4m0 8h2v2h-2v-2m2 0h2v2h-2v-2m-2 2h2v2h-2v-2m4-2h2v4h-2v-4m0 4h2v2h-2v-2m-4 0h2v2h-2v-2m2-2h2v2h-2v-2m-2 0h2v2h-2v-2z"/>
                  </svg>
                  <p className="text-sm text-gray-600 font-medium">BIG GAMES</p>
                  <p className="text-xs text-gray-500">Rp {parseFloat(reservation.total_amount).toLocaleString()}</p>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>Scan QR code with your mobile banking</p>
                <p className="font-semibold">or e-wallet app</p>
              </div>
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold text-xl text-white">Bank Transfer</h3>
            
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs text-slate-400">Bank Name</p>
                <p className="font-semibold text-white">{paymentInfo.bank_name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Account Number</p>
                <p className="font-mono font-semibold text-lg text-white">{paymentInfo.bank_account}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Account Name</p>
                <p className="font-semibold text-white">{paymentInfo.bank_account_name}</p>
              </div>
            </div>
          </div>

          {/* Upload Payment Proof */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold text-xl text-white">Upload Payment Proof</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-200">
                Payment Proof URL *
              </label>
              <input
                type="url"
                className="input-field"
                placeholder="https://example.com/receipt.jpg"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">
                Upload your receipt to image hosting service and paste the URL here
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-200">
                Reference Number (Optional)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., BCA-123456789"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={uploading || !proofUrl.trim()}
              className="w-full btn-primary disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Submit Payment Proof"}
            </button>

            <div className="text-center">
              <p className="text-xs text-slate-500 mb-2">Or for demo purposes:</p>
              <button
                onClick={handleDemoConfirm}
                disabled={uploading}
                className="btn-secondary w-full"
              >
                ✓ Confirm Payment (Demo)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Booking Summary */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold text-xl text-white">Booking Summary</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-400">Room</p>
                <p className="font-semibold text-lg text-white">{reservation.room?.name || 'Loading...'}</p>
                <p className="text-sm text-slate-300">{reservation.room?.category || ''}</p>
              </div>

              <div className="h-px bg-white/10" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Date</p>
                  <p className="font-semibold text-white">{startDate.toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Time</p>
                  <p className="font-semibold text-white">
                    {startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400">Duration</p>
                <p className="font-semibold text-white">{reservation.duration_hours} hours</p>
              </div>

              <div className="h-px bg-slate-700" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span>Rp {parseFloat(reservation.subtotal).toLocaleString()}</span>
                </div>
                
                {parseFloat(reservation.discount_amount) > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>- Rp {parseFloat(reservation.discount_amount).toLocaleString()}</span>
                  </div>
                )}
                
                <div className="h-px bg-slate-700 my-2" />
                
                <div className="flex justify-between text-xl font-bold text-white">
                  <span>Total</span>
                  <span className="text-purple-400">
                    Rp {parseFloat(reservation.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <p className="font-semibold text-yellow-400 mb-1">Waiting for Payment</p>
                  <p className="text-slate-400 text-xs">
                    Please complete the payment and upload your proof. Our team will verify within 1-2 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Reservation ID */}
            <div className="text-center pt-2 border-t border-slate-700">
              <p className="text-xs text-slate-500">Booking ID</p>
              <p className="font-mono text-xs text-slate-400">{reservation.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
