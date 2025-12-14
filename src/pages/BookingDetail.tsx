import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import { consoles } from "../services/consoles"
import { saveBooking } from "../services/bookings"
import { useAuth } from "../context/AuthContext"

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("10:00")
  const [duration, setDuration] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const consoleData = consoles.find((c) => c.id === id)

  if (!consoleData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-white/60">Console tidak ditemukan</p>
          <button onClick={() => navigate("/")} className="mt-4 btn-primary">
            Kembali ke Home
          </button>
        </div>
      </div>
    )
  }

  const totalPrice = duration * consoleData.pricePerHour

  function handleSubmit() {
    if (!consoleData) return
    if (!date) {
      setError("Tanggal wajib diisi")
      return
    }
    if (!startTime) {
      setError("Waktu mulai wajib diisi")
      return
    }

    const bookingId = crypto.randomUUID()

    saveBooking({
      id: bookingId,
      consoleId: consoleData.id,
      consoleName: consoleData.name,
      date,
      startTime,
      duration,
      totalPrice,
      createdAt: new Date().toISOString(),
      status: "PENDING",
      userName: user?.name,
    })

    navigate(`/payment/${bookingId}`)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Console Info */}
      <div className="glass-card overflow-hidden">
        <div className="relative h-64">
          <img
            src={consoleData.image}
            alt={consoleData.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/80 backdrop-blur-sm mb-2">
              {consoleData.category}
            </span>
            <h1 className="text-3xl font-bold text-white">{consoleData.name}</h1>
            <p className="text-white/80 mt-2">{consoleData.description}</p>
          </div>
        </div>

        {/* Booking Form */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2 text-white/80">
                Tanggal Booking
              </label>
              <input
                id="date"
                type="date"
                className="input-field"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  setError(null)
                }}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Time */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium mb-2 text-white/80">
                Waktu Mulai
              </label>
              <input
                id="time"
                type="time"
                className="input-field"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value)
                  setError(null)
                }}
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium mb-2 text-white/80">
              Durasi (jam)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setDuration(hours)}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                    duration === hours
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Price Summary */}
          <div className="glass-card p-6 space-y-3">
            <div className="flex justify-between text-white/60">
              <span>Harga per jam</span>
              <span>Rp {consoleData.pricePerHour.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Durasi</span>
              <span>{duration} jam</span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Rp {totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button onClick={handleSubmit} className="w-full btn-primary">
            Lanjut ke Pembayaran
          </button>
        </div>
      </div>
    </div>
  )
}
