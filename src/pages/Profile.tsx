import { useAuth } from "../context/AuthContext"
import { useBookings } from "../context/BookingContext"
import { useNavigate } from "react-router-dom"

export default function Profile() {
  const { user, logout } = useAuth()
  const { bookings } = useBookings()
  const navigate = useNavigate()

  if (!user) {
    navigate("/login")
    return null
  }

  const userBookings = bookings.filter(b => b.userName === user.name)

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="glass-card p-8 text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto flex items-center justify-center text-3xl font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-white/60 mt-1">
            {user.role === "ADMIN" ? "Administrator" : "Member"}
          </p>
        </div>
        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </div>

      {/* Booking History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Riwayat Booking</h2>
          <span className="text-sm text-white/60">{userBookings.length} booking</span>
        </div>

        {userBookings.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-white/60 mb-4">Belum ada riwayat booking</p>
            <button onClick={() => navigate("/")} className="btn-primary">
              Mulai Booking
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {userBookings.map((booking) => (
              <div key={booking.id} className="glass-card p-6 hover:bg-white/10 transition-all">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{booking.consoleName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === "PAID"
                          ? "bg-green-500/20 text-green-400"
                          : booking.status === "COMPLETED"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-white/60">
                      <div>📅 {booking.date}</div>
                      <div>⏰ {booking.startTime || "-"}</div>
                      <div>⏱️ {booking.duration} jam</div>
                      <div>💰 Rp {booking.totalPrice.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <button className="text-purple-400 hover:text-purple-300 text-sm font-semibold">
                    Detail →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 text-center">
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {userBookings.length}
          </p>
          <p className="text-sm text-white/60 mt-1">Total Booking</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {userBookings.filter(b => b.status === "PAID").length}
          </p>
          <p className="text-sm text-white/60 mt-1">Aktif</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {userBookings.reduce((sum, b) => sum + b.duration, 0)}
          </p>
          <p className="text-sm text-white/60 mt-1">Total Jam</p>
        </div>
      </div>
    </div>
  )
}
