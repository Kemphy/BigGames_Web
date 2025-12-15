import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { reservationService } from "../services/reservation.service"
import { roomService } from "../services/room.service"
import { foodService } from "../services/food.service"
import type { Reservation } from "../types/api"
import type { FoodOrder } from "../types/food"

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("ALL")
  const [activeTab, setActiveTab] = useState<"bookings" | "food">("bookings")

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }
    loadReservations()
    loadFoodOrders()
  }, [user, filter])

  const loadReservations = async () => {
    try {
      const allReservations = await reservationService.getMyReservations()
      
      // Apply filter on client side
      const filteredReservations = filter === "ALL" 
        ? allReservations 
        : allReservations.filter(r => r.status === filter)
      
      // Fetch room data for reservations that don't have it
      const reservationsWithRooms = await Promise.all(
        filteredReservations.map(async (reservation) => {
          if (!reservation.room && reservation.room_id) {
            try {
              const room = await roomService.getRoomById(reservation.room_id)
              return { ...reservation, room }
            } catch (err) {
              console.error(`Failed to fetch room ${reservation.room_id}:`, err)
              return reservation
            }
          }
          return reservation
        })
      )
      
      setReservations(reservationsWithRooms)
    } catch (err) {
      console.error("Failed to load reservations:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadFoodOrders = async () => {
    try {
      const orders = await foodService.getMyOrders()
      setFoodOrders(orders)
    } catch (err) {
      console.error("Failed to load food orders:", err)
    }
  }

  const getFoodStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "COOKING":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "DELIVERING":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "CANCELLED":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return
    
    try {
      await reservationService.cancelReservation(id)
      loadReservations() // Reload list
    } catch (err) {
      alert("Failed to cancel reservation")
      console.error(err)
    }
  }

  if (!user) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "PENDING_PAYMENT":
      case "WAITING_CONFIRMATION":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "COMPLETED":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "CANCELLED":
      case "REJECTED":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const stats = {
    total: reservations.length,
    active: reservations.filter(r => r.status === "CONFIRMED" || r.status === "WAITING_CONFIRMATION").length,
    completed: reservations.filter(r => r.status === "COMPLETED").length,
    points: reservations.filter(r => r.status === "COMPLETED").length * 10 + foodOrders.filter(o => o.status === "COMPLETED").length * 5
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="glass-card p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-3xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          
          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            <p className="text-white/60 mb-1">{user.email}</p>
            <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-semibold">
              {user.role}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-6">
          <p className="text-sm text-white/50 mb-1">Total Bookings</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {stats.total}
          </p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/50 mb-1">Active</p>
          <p className="text-3xl font-bold text-yellow-400">{stats.active}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/50 mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/50 mb-1">Reward Points</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl">⭐</span>
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {stats.points} pts
            </p>
          </div>
          <p className="text-xs text-white/40 mt-1">Booking +10 pts, F&B +5 pts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card">
        <div className="border-b border-white/10">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "bookings"
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-white/60 hover:text-white/80 hover:border-white/20"
              }`}
            >
              My Bookings
            </button>
            <button
              onClick={() => setActiveTab("food")}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "food"
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-white/60 hover:text-white/80 hover:border-white/20"
              }`}
            >
              F&B Orders
            </button>
          </nav>
        </div>

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-xl font-bold">Room Bookings</h3>
            
            {/* Filter */}
            <div className="flex flex-wrap gap-2">
              {["ALL", "PENDING_PAYMENT", "WAITING_CONFIRMATION", "CONFIRMED", "COMPLETED", "CANCELLED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filter === status
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-white/60">Loading bookings...</p>
          </div>
        ) : reservations.length > 0 ? (
          <div className="space-y-4">
            {reservations.map((reservation) => {
              const startDate = new Date(reservation.start_time)
              const endDate = new Date(reservation.end_time)
              
              // Skip if room data is missing
              if (!reservation.room) {
                return null
              }
              
              return (
                <div key={reservation.id} className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Room Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold mb-1">{reservation.room.name}</h3>
                          <p className="text-sm text-white/60">{reservation.room.category}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(reservation.status)}`}>
                          {reservation.status.replace('_', ' ')}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-white/50">Date</p>
                          <p className="font-semibold">
                            {startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/50">Time</p>
                          <p className="font-semibold">
                            {startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/50">Duration</p>
                          <p className="font-semibold">{reservation.duration_hours} hours</p>
                        </div>
                        <div>
                          <p className="text-white/50">Total</p>
                          <p className="font-semibold text-purple-400">
                            Rp {parseFloat(reservation.total_amount).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:ml-4">
                      {reservation.status === "CONFIRMED" && (
                        <button
                          onClick={() => navigate(`/success/${reservation.id}`, { state: { reservation } })}
                          className="btn-secondary px-6 py-2 text-sm whitespace-nowrap"
                        >
                          View Details
                        </button>
                      )}
                      {reservation.status === "PENDING_PAYMENT" && (
                        <button
                          onClick={() => navigate(`/payment/${reservation.id}`, { state: { reservation } })}
                          className="btn-primary px-6 py-2 text-sm whitespace-nowrap"
                        >
                          Complete Payment
                        </button>
                      )}
                      {(reservation.status === "PENDING_PAYMENT" || reservation.status === "WAITING_CONFIRMATION") && (
                        <button
                          onClick={() => handleCancelBooking(reservation.id)}
                          className="px-6 py-2 text-sm rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors whitespace-nowrap"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/60 mb-4">No bookings found</p>
            <button onClick={() => navigate("/")} className="btn-primary">
              Make a Booking
            </button>
          </div>
        )}
        </div>
        )}

        {/* F&B Orders Tab */}
        {activeTab === "food" && (
        <div className="p-6">
          <h3 className="text-xl font-bold mb-6">Food & Beverage Orders</h3>

          {foodOrders.length > 0 ? (
            <div className="space-y-4">
              {foodOrders.map((order) => {
                const orderDate = new Date(order.created_at)
                
                return (
                  <div key={order.id} className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold mb-1">Order #{order.id.substring(0, 8)}</h3>
                            <p className="text-sm text-white/60">{order.room_name || 'Room ' + order.room_id}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getFoodStatusColor(order.status)}`}>
                            {order.status}
                          </div>
                        </div>
                        
                        {/* Items List */}
                        <div className="mb-4">
                          <p className="text-sm text-white/50 mb-2">Items:</p>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-sm text-white/80 flex justify-between">
                              <span>{item.menu_item_name || 'Item'} x{item.qty}</span>
                              <span>Rp {parseFloat(item.subtotal).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-white/50">Order Date</p>
                            <p className="font-semibold">
                              {orderDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div>
                            <p className="text-white/50">Time</p>
                            <p className="font-semibold">
                              {orderDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div>
                            <p className="text-white/50">Subtotal</p>
                            <p className="font-semibold">
                              Rp {parseFloat(order.subtotal).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-white/50">Total</p>
                            <p className="font-semibold text-purple-400">
                              Rp {parseFloat(order.total_amount).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {order.notes && (
                          <div className="mt-4 p-3 bg-white/5 rounded-lg">
                            <p className="text-sm text-white/50">Notes:</p>
                            <p className="text-sm text-white/80">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-white/40 text-5xl mb-4">🍔</div>
              <p className="text-white/60 mb-4">No food orders yet</p>
              <button
                onClick={() => navigate('/food')}
                className="btn-primary"
              >
                Order Now
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  )
}
