import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { roomService } from "../services/room.service"
import { reservationService } from "../services/reservation.service"
import { promoService } from "../services/promo.service"
import { aiService } from "../services/ai.service"
import { useAuth } from "../context/AuthContext"
import Footer from "../components/Footer"
import type { Room, RoomSlots, TimeSlot } from "../types/api"

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [room, setRoom] = useState<Room | null>(null)
  const [timeSlots, setTimeSlots] = useState<RoomSlots | null>(null)
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([])
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [promoCode, setPromoCode] = useState("")
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoValid, setPromoValid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [promoMessage, setPromoMessage] = useState("")

  // Load room details and track view
  useEffect(() => {
    if (id) {
      loadRoom()
      // Track VIEW_ROOM event
      aiService.logEvent({
        room_id: id,
        event_type: "VIEW_ROOM"
      }).catch(err => console.error("Failed to log view event:", err))
    }
  }, [id])

  // Load time slots when date changes
  useEffect(() => {
    if (id && date) {
      loadTimeSlots()
    }
  }, [id, date])

  const loadRoom = async () => {
    try {
      const roomData = await roomService.getRoomById(id!)
      setRoom(roomData)
    } catch (err) {
      setError("Failed to load room details")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadTimeSlots = async () => {
    setLoadingSlots(true)
    try {
      const slots = await roomService.getRoomTimeSlots(id!, date)
      setTimeSlots(slots)
      setSelectedSlots([]) // Reset selection when date changes
    } catch (err) {
      console.error("Failed to load time slots:", err)
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.is_available) return

    const isSelected = selectedSlots.some(s => s.start_hour === slot.start_hour)
    
    if (isSelected) {
      setSelectedSlots(selectedSlots.filter(s => s.start_hour !== slot.start_hour))
    } else {
      // Add slot and sort by start_hour
      const newSlots = [...selectedSlots, slot].sort((a, b) => a.start_hour - b.start_hour)
      
      // Check if slots are consecutive
      const isConsecutive = newSlots.every((s, i) => {
        if (i === 0) return true
        return s.start_hour === newSlots[i - 1].end_hour
      })
      
      if (isConsecutive) {
        setSelectedSlots(newSlots)
      } else {
        setError("Please select consecutive time slots")
        setTimeout(() => setError(null), 3000)
      }
    }
  }

  const validatePromo = async () => {
    if (!promoCode.trim()) return
    
    const subtotal = parseFloat(String(room!.base_price_per_hour)) * selectedSlots.length
    
    try {
      const result = await promoService.validatePromo(promoCode, subtotal)
      if (result.valid) {
        setPromoValid(true)
        setPromoDiscount(result.discount_amount || 0)
        setPromoMessage(`Promo ${promoCode} applied! Discount: Rp ${(result.discount_amount || 0).toLocaleString()}`)
      } else {
        setPromoValid(false)
        setPromoDiscount(0)
        setPromoMessage("Invalid promo code")
      }
    } catch (err) {
      setPromoValid(false)
      setPromoDiscount(0)
      setPromoMessage("Failed to validate promo code")
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      navigate("/login")
      return
    }

    if (selectedSlots.length === 0) {
      setError("Please select at least one time slot")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Create ISO datetime strings
      const startTime = new Date(`${date}T${String(selectedSlots[0].start_hour).padStart(2, '0')}:00:00Z`).toISOString()
      const endTime = new Date(`${date}T${String(selectedSlots[selectedSlots.length - 1].end_hour).padStart(2, '0')}:00:00Z`).toISOString()

      const reservation = await reservationService.createReservation({
        room_id: id!,
        start_time: startTime,
        end_time: endTime,
        promo_code: promoValid ? promoCode : undefined
      })

      // Track BOOK_ROOM event
      try {
        await aiService.logEvent({
          room_id: id!,
          event_type: "BOOK_ROOM"
        })
      } catch (err) {
        console.error("Failed to log book event:", err)
      }

      // Navigate to payment page with reservation data
      navigate(`/payment/${reservation.id}`, { 
        state: { reservation } 
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create reservation")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-2xl text-white/60">Room not found</p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  // Get appropriate image from assets folder
  const getDefaultImage = (category: string, roomName: string) => {
    const name = roomName.toLowerCase()
    
    if (category === "VIP") {
      if (name.includes("vip 1") || name.includes("vip room 1")) return "/src/assets/VIP room 1.png"
      if (name.includes("vip 2") || name.includes("vip room 2")) return "/src/assets/VIP room 2.png"
      if (name.includes("vip 3") || name.includes("vip room 3")) return "/src/assets/VIP room 3.png"
      return "/src/assets/VIP room 1.png"
    }
    
    if (category === "SIMULATOR") {
      return "/src/assets/Simulator room.png"
    }
    
    // REGULAR category
    if (name.includes("regular 1") || name.includes("regular room 1")) return "/src/assets/Reguler room 1.png"
    if (name.includes("regular 2") || name.includes("regular room 2")) return "/src/assets/Reguler room 2.png"
    return "/src/assets/Reguler room 1.png"
  }

  const imageUrl = room.images[0] || getDefaultImage(room.category, room.name)
  const subtotal = parseFloat(String(room.base_price_per_hour)) * selectedSlots.length
  const total = subtotal - promoDiscount

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Room Header */}
      <div className="glass-card overflow-hidden">
        <div className="relative h-64">
          <img src={imageUrl} alt={room.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/80 backdrop-blur-sm mb-2">
              {room.category}
            </span>
            <h1 className="text-3xl font-bold text-white">{room.name}</h1>
            <p className="text-white/80 mt-2">{room.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-white/70">
              <span>Capacity: {room.capacity} people</span>
              <span>•</span>
              <span>{room.units[0]?.console_type.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Slots Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date Picker */}
          <div className="glass-card p-6">
            <label htmlFor="booking-date" className="block text-sm font-medium mb-3 text-white/80">
              Select Date
            </label>
            <input
              id="booking-date"
              type="date"
              className="input-field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              aria-label="Select booking date"
            />
          </div>

          {/* Time Slots Grid */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Available Time Slots</h3>
            
            {loadingSlots ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-white/60">Loading slots...</p>
              </div>
            ) : timeSlots?.slots && timeSlots.slots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {timeSlots.slots.map((slot) => {
                  const isSelected = selectedSlots.some(s => s.start_hour === slot.start_hour)
                  const isAvailable = slot.is_available
                  
                  return (
                    <button
                      key={slot.start_hour}
                      onClick={() => handleSlotClick(slot)}
                      disabled={!isAvailable}
                      className={`p-3 rounded-lg font-medium transition-all text-sm ${
                        isSelected
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                          : isAvailable
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : "bg-white/5 text-white/30 cursor-not-allowed"
                      }`}
                    >
                      {String(slot.start_hour).padStart(2, '0')}:00
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-white/60 py-8">No time slots available for this date</p>
            )}

            {selectedSlots.length > 0 && (
              <div className="mt-4 p-4 bg-blue-500/20 rounded-lg">
                <p className="text-sm text-white/80">
                  Selected: {selectedSlots[0].start_hour}:00 - {selectedSlots[selectedSlots.length - 1].end_hour}:00
                  ({selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''})
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Summary */}
        <div className="space-y-6">
          {/* Promo Code */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Promo Code</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter promo code"
                className="input-field flex-1"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase())
                  setPromoValid(false)
                  setPromoMessage("")
                }}
                aria-label="Promo code input"
              />
              <button
                onClick={validatePromo}
                disabled={!promoCode.trim() || selectedSlots.length === 0}
                className="btn-secondary px-4 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
            {promoMessage && (
              <p className={`text-sm ${promoValid ? 'text-green-400' : 'text-red-400'}`}>
                {promoMessage}
              </p>
            )}
            <div className="text-xs text-white/50 space-y-1">
              <p>Try: NEWUSER (10% off)</p>
              <p>WEEKEND20 (20% off)</p>
              <p>FLAT10K (Rp 10,000 off)</p>
            </div>
          </div>

          {/* Price Summary */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Booking Summary</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/60">
                <span>Price per hour</span>
                <span>Rp {parseFloat(String(room.base_price_per_hour)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Duration</span>
                <span>{selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString()}</span>
              </div>
              
              {promoDiscount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount ({promoCode})</span>
                  <span>- Rp {promoDiscount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="h-px bg-white/10 my-2" />
              
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Rp {total.toLocaleString()}
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={selectedSlots.length === 0 || submitting || !user}
              className="w-full btn-primary disabled:opacity-50"
            >
              {submitting ? "Processing..." : !user ? "Login to Book" : "Continue to Payment"}
            </button>

            {!user && (
              <p className="text-xs text-center text-white/50">
                Please login to make a booking
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
