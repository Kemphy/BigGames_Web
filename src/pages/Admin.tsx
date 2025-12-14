import { useBookings } from "../context/BookingContext"
import { useState } from "react"

export default function Admin() {
  const { bookings } = useBookings()
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "PAID" | "COMPLETED">("ALL")

  const filteredBookings = filter === "ALL" 
    ? bookings 
    : bookings.filter(b => b.status === filter)

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "PENDING").length,
    paid: bookings.filter(b => b.status === "PAID").length,
    revenue: bookings.filter(b => b.status === "PAID").reduce((sum, b) => sum + b.totalPrice, 0)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-white/60">Kelola semua booking dan transaksi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-1">📊 Total Booking</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-1">⏳ Pending</p>
          <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-1">✅ Paid</p>
          <p className="text-3xl font-bold text-green-400">{stats.paid}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-1">💰 Revenue</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Rp {stats.revenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "PENDING", "PAID", "COMPLETED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === status
                ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-semibold text-white/80">Console</th>
                <th className="text-left p-4 text-sm font-semibold text-white/80">Customer</th>
                <th className="text-left p-4 text-sm font-semibold text-white/80">Date & Time</th>
                <th className="text-left p-4 text-sm font-semibold text-white/80">Duration</th>
                <th className="text-left p-4 text-sm font-semibold text-white/80">Total</th>
                <th className="text-left p-4 text-sm font-semibold text-white/80">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-white/40">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold">{b.consoleName}</p>
                      <p className="text-xs text-white/40">{b.id.slice(0, 8)}...</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{b.userName || "-"}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{b.date}</p>
                      <p className="text-xs text-white/60">{b.startTime || "-"}</p>
                    </td>
                    <td className="p-4 text-sm">{b.duration} jam</td>
                    <td className="p-4 font-semibold">Rp {b.totalPrice.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        b.status === "PAID"
                          ? "bg-green-500/20 text-green-400"
                          : b.status === "COMPLETED"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
