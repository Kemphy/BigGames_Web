import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { adminService, type AdminReservation } from "../services/admin.service"
import { roomService } from "../services/room.service"
import { foodService } from "../services/food.service"
import { reservationService } from "../services/reservation.service"
import type { FoodOrder } from "../types/food"

interface DashboardStats {
  todayRevenue: number
  todayBookings: number
  pendingPayments: number
  activeBookings: number
  pendingFoodOrders: number
  totalFoodOrders: number
}

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayBookings: 0,
    pendingPayments: 0,
    activeBookings: 0,
    pendingFoodOrders: 0,
    totalFoodOrders: 0
  })
  const [reservations, setReservations] = useState<AdminReservation[]>([])
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("ALL")
  const [foodFilter, setFoodFilter] = useState<string>("ALL")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"reservations" | "food">("reservations")
  const [editingReservation, setEditingReservation] = useState<AdminReservation | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingFoodOrder, setEditingFoodOrder] = useState<FoodOrder | null>(null)
  const [showFoodEditModal, setShowFoodEditModal] = useState(false)

  useEffect(() => {
    if (!user || (user.role !== "ADMIN" && user.role !== "FINANCE")) {
      navigate("/")
      return
    }
    loadData()
  }, [user, filter, foodFilter])

  const loadData = async () => {
    try {
      // Fetch all reservations from admin endpoint
      const allReservations = await adminService.getAllReservations({
        status: filter === "ALL" ? undefined : filter
      })
      
      // Fetch room data for reservations that don't have room object
      const reservationsWithRooms = await Promise.all(
        allReservations.map(async (reservation) => {
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

      // Fetch all food orders
      let allFoodOrders: any[] = []
      try {
        allFoodOrders = await foodService.getAllOrders({
          status: foodFilter === "ALL" ? undefined : foodFilter
        })
        setFoodOrders(allFoodOrders)
      } catch (err) {
        console.warn("Food orders endpoint not available:", err)
        setFoodOrders([])
      }

      // Calculate stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const todayBookings = reservationsWithRooms.filter(r => {
        const createdDate = new Date(r.created_at)
        createdDate.setHours(0, 0, 0, 0)
        return createdDate.getTime() === today.getTime()
      })

      const todayFoodOrders = allFoodOrders.filter(o => {
        const createdDate = new Date(o.created_at)
        createdDate.setHours(0, 0, 0, 0)
        return createdDate.getTime() === today.getTime()
      })

      const todayFoodRevenue = todayFoodOrders
        .filter(o => o.status === "COMPLETED")
        .reduce((sum, o) => sum + parseFloat(o.total_amount), 0)

      setStats({
        todayRevenue: todayBookings
          .filter(r => r.status === "CONFIRMED" || r.status === "COMPLETED")
          .reduce((sum, r) => sum + parseFloat(r.total_amount), 0) + todayFoodRevenue,
        todayBookings: todayBookings.length,
        pendingPayments: reservationsWithRooms.filter(r => r.status === "WAITING_CONFIRMATION").length,
        activeBookings: reservationsWithRooms.filter(r => r.status === "CONFIRMED").length,
        pendingFoodOrders: allFoodOrders.filter(o => o.status === "PENDING" || o.status === "COOKING").length,
        totalFoodOrders: allFoodOrders.length
      })
    } catch (err) {
      console.error("Failed to load admin data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPayment = async (paymentId: string, action: "approve" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this payment?`)) return
    
    try {
      if (action === "approve") {
        await adminService.confirmPayment(paymentId)
      } else {
        await adminService.rejectPayment(paymentId)
      }
      alert(`Payment ${action}d successfully`)
      loadData() // Reload data
    } catch (err: any) {
      alert(`Failed to ${action} payment`)
      console.error(err)
    }
  }

  const handleUpdateStatus = async (reservationId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return
    
    try {
      await adminService.updateReservationStatus(reservationId, newStatus)
      alert("Status updated successfully")
      loadData()
    } catch (err: any) {
      alert("Failed to update status")
      console.error(err)
    }
  }

  const handleUpdateFoodStatus = async (orderId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to change order status to ${newStatus}?`)) return
    
    try {
      await foodService.updateOrderStatus(orderId, newStatus)
      alert("Order status updated successfully")
      loadData()
    } catch (err: any) {
      alert("Failed to update order status")
      console.error(err)
    }
  }

  const handleEditReservation = (reservation: AdminReservation) => {
    setEditingReservation(reservation)
    setShowEditModal(true)
  }

  const handleDeleteReservation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reservation?")) return
    
    try {
      await reservationService.cancelReservation(id)
      alert("Reservation deleted successfully")
      loadData()
    } catch (err: any) {
      alert("Failed to delete reservation")
      console.error(err)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingReservation) return
    
    try {
      // Update reservation via admin service
      await adminService.updateReservationStatus(editingReservation.id, editingReservation.status)
      alert("Reservation updated successfully")
      setShowEditModal(false)
      setEditingReservation(null)
      loadData()
    } catch (err: any) {
      alert("Failed to update reservation")
      console.error(err)
    }
  }

  const handleEditFoodOrder = (order: FoodOrder) => {
    setEditingFoodOrder(order)
    setShowFoodEditModal(true)
  }

  const handleDeleteFoodOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this food order?")) return
    
    try {
      await foodService.updateOrderStatus(id, "CANCELLED")
      alert("Food order deleted successfully")
      loadData()
    } catch (err: any) {
      alert("Failed to delete food order")
      console.error(err)
    }
  }

  const handleSaveFoodEdit = async () => {
    if (!editingFoodOrder) return
    
    try {
      await foodService.updateOrderStatus(editingFoodOrder.id, editingFoodOrder.status)
      alert("Food order updated successfully")
      setShowFoodEditModal(false)
      setEditingFoodOrder(null)
      loadData()
    } catch (err: any) {
      alert("Failed to update food order")
      console.error(err)
    }
  }

  const getFoodStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "COOKING":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "DELIVERING":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800 border-green-200"
      case "PENDING_PAYMENT":
      case "WAITING_CONFIRMATION":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "CANCELLED":
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredReservations = reservations.filter(r => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        (r.room?.name?.toLowerCase().includes(search)) ||
        (r.room_name?.toLowerCase().includes(search)) ||
        (r.user?.name?.toLowerCase().includes(search)) ||
        (r.user_name?.toLowerCase().includes(search)) ||
        (r.user?.email?.toLowerCase().includes(search)) ||
        (r.user_email?.toLowerCase().includes(search)) ||
        r.id.toLowerCase().includes(search)
      )
    }
    return true
  })

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {user.name}</p>
          </div>
          <button onClick={() => logout()} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rp {stats.todayRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Today's Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayBookings}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Food Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingFoodOrders}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total F&B Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFoodOrders}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-2xl">
                🍔
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("reservations")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "reservations"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Reservations
              </button>
              <button
                onClick={() => setActiveTab("food")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "food"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                F&B Orders
              </button>
            </nav>
          </div>
        </div>

        {/* Reservations Table */}
        {activeTab === "reservations" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">All Reservations</h2>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search by name, email, room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                />
                
                {/* Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                  aria-label="Filter by status"
                >
                  <option value="ALL" className="text-gray-900">Semua Status ({reservations.length})</option>
                  <option value="PENDING_PAYMENT" className="text-gray-900">Menunggu Pembayaran ({reservations.filter(r => r.status === "PENDING_PAYMENT").length})</option>
                  <option value="WAITING_CONFIRMATION" className="text-gray-900">Menunggu Konfirmasi ({reservations.filter(r => r.status === "WAITING_CONFIRMATION").length})</option>
                  <option value="CONFIRMED" className="text-gray-900">Dikonfirmasi ({reservations.filter(r => r.status === "CONFIRMED").length})</option>
                  <option value="COMPLETED" className="text-gray-900">Selesai ({reservations.filter(r => r.status === "COMPLETED").length})</option>
                  <option value="CANCELLED" className="text-gray-900">Dibatalkan ({reservations.filter(r => r.status === "CANCELLED").length})</option>
                  <option value="REJECTED" className="text-gray-900">Ditolak ({reservations.filter(r => r.status === "REJECTED").length})</option>
                </select>
              </div>
            </div>
            {/* Filter Info */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredReservations.length} of {reservations.length} reservations
              {filter !== "ALL" && ` with status: ${filter.replace('_', ' ')}`}
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading reservations...</p>
              </div>
            ) : filteredReservations.length > 0 ? (
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">ID</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Customer</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-28">Room</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Date/Time</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Duration</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Total</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-28">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservations.map((reservation) => {
                    const startDate = new Date(reservation.start_time)
                    const endDate = new Date(reservation.end_time)
                    
                    return (
                      <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3 text-xs font-mono text-gray-900 truncate" title={reservation.id}>
                          {reservation.id.substring(0, 6)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs font-medium text-gray-900 truncate" title={reservation.user_name || reservation.user?.name || undefined}>{reservation.user_name || reservation.user?.name || 'N/A'}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs font-medium text-gray-900 truncate" title={reservation.room?.name || reservation.room_name || undefined}>{reservation.room?.name || reservation.room_name || 'N/A'}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-gray-900">
                            {startDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-900">
                          {Math.floor(parseFloat(reservation.duration_hours))} jam
                        </td>
                        <td className="px-3 py-3 text-xs font-semibold text-gray-900">
                          {(parseFloat(reservation.total_amount) / 1000).toFixed(0)}k
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full border ${getStatusColor(reservation.status)}`}>
                            {reservation.status === 'PENDING_PAYMENT' ? 'PENDING' : reservation.status === 'WAITING_CONFIRMATION' ? 'WAITING' : reservation.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm">
                          <div className="flex flex-wrap gap-1">
                            {(reservation.payment_status === "WAITING_CONFIRMATION" || reservation.status === "PENDING_PAYMENT") && reservation.payment && (
                              <>
                                <button
                                  onClick={() => reservation.payment && handleVerifyPayment(reservation.payment.id, "approve")}
                                  className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs"
                                  title="Approve"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => reservation.payment && handleVerifyPayment(reservation.payment.id, "reject")}
                                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs"
                                  title="Reject"
                                >
                                  ✗
                                </button>
                                {reservation.payment?.payment_proof_url && (
                                  <a
                                    href={reservation.payment.payment_proof_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                                    title="View Proof"
                                  >
                                    👁️
                                  </a>
                                )}
                              </>
                            )}
                            {reservation.status === "CONFIRMED" && (
                              <button
                                onClick={() => handleUpdateStatus(reservation.id, "COMPLETED")}
                                className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                                title="Complete"
                              >
                                ✓
                              </button>
                            )}
                            <button
                              onClick={() => handleEditReservation(reservation)}
                              className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-xs"
                              title="Edit"
                            >
                              📝
                            </button>
                            <button
                              onClick={() => handleDeleteReservation(reservation.id)}
                              className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-xs"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No reservations found</p>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Food Orders Table */}
        {activeTab === "food" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">F&B Orders</h2>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Filter */}
                <select
                  value={foodFilter}
                  onChange={(e) => setFoodFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                  aria-label="Filter by food order status"
                >
                  <option value="ALL" className="text-gray-900">Semua Status ({foodOrders.length})</option>
                  <option value="PENDING" className="text-gray-900">Pending ({foodOrders.filter(o => o.status === "PENDING").length})</option>
                  <option value="COOKING" className="text-gray-900">Cooking ({foodOrders.filter(o => o.status === "COOKING").length})</option>
                  <option value="DELIVERING" className="text-gray-900">Delivering ({foodOrders.filter(o => o.status === "DELIVERING").length})</option>
                  <option value="COMPLETED" className="text-gray-900">Completed ({foodOrders.filter(o => o.status === "COMPLETED").length})</option>
                  <option value="CANCELLED" className="text-gray-900">Cancelled ({foodOrders.filter(o => o.status === "CANCELLED").length})</option>
                </select>
              </div>
            </div>
            {/* Filter Info */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {foodOrders.filter(o => foodFilter === "ALL" || o.status === foodFilter).length} of {foodOrders.length} orders
              {foodFilter !== "ALL" && ` with status: ${foodFilter}`}
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading orders...</p>
              </div>
            ) : foodOrders.length > 0 ? (
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">ID</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Room</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-40">Items</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-28">Date</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">Total</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {foodOrders.map((order) => {
                    const orderDate = new Date(order.created_at)
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3 text-xs font-mono text-gray-900 truncate" title={order.id}>
                          {order.id.substring(0, 6)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs font-medium text-gray-900 truncate" title={order.room_name || order.room_id}>{order.room_name || 'N/A'}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-gray-900">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="truncate">
                                {item.menu_item_name || 'Item'} x{item.qty}
                              </div>
                            ))}
                            {order.items.length > 2 && <div className="text-xs text-gray-500">+{order.items.length - 2} more</div>}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-gray-900">
                            {orderDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {orderDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs font-semibold text-gray-900">
                          {(parseFloat(order.total_amount) / 1000).toFixed(0)}k
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full border ${getFoodStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm">
                          <div className="flex flex-wrap gap-1">
                            {order.status === "PENDING" && (
                              <button
                                onClick={() => handleUpdateFoodStatus(order.id, "COOKING")}
                                className="px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-xs"
                                title="Cook"
                              >
                                🍳
                              </button>
                            )}
                            {order.status === "COOKING" && (
                              <button
                                onClick={() => handleUpdateFoodStatus(order.id, "DELIVERING")}
                                className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                                title="Deliver"
                              >
                                🚚
                              </button>
                            )}
                            {order.status === "DELIVERING" && (
                              <button
                                onClick={() => handleUpdateFoodStatus(order.id, "COMPLETED")}
                                className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs"
                                title="Complete"
                              >
                                ✓
                              </button>
                            )}
                            {(order.status === "PENDING" || order.status === "COOKING") && (
                              <button
                                onClick={() => handleUpdateFoodStatus(order.id, "CANCELLED")}
                                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs"
                                title="Cancel"
                              >
                                ✗
                              </button>
                            )}
                            <button
                              onClick={() => handleEditFoodOrder(order)}
                              className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-xs"
                              title="Edit"
                            >
                              📝
                            </button>
                            <button
                              onClick={() => handleDeleteFoodOrder(order.id)}
                              className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-xs"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No food orders found</p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Edit Reservation Modal */}
      {showEditModal && editingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Edit Reservation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={editingReservation.user_name || 'N/A'}
                  disabled
                  aria-label="Customer Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room
                </label>
                <input
                  type="text"
                  value={editingReservation.room?.name || editingReservation.room_name || 'N/A'}
                  disabled
                  aria-label="Room Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={new Date(editingReservation.start_time).toISOString().slice(0, 16)}
                  onChange={(e) => {
                    const newStartTime = new Date(e.target.value).toISOString()
                    setEditingReservation({
                      ...editingReservation,
                      start_time: newStartTime
                    })
                  }}
                  aria-label="Start Time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={Math.floor(parseFloat(editingReservation.duration_hours))}
                  onChange={(e) => {
                    setEditingReservation({
                      ...editingReservation,
                      duration_hours: e.target.value
                    })
                  }}
                  aria-label="Duration in hours"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editingReservation.status}
                  onChange={(e) => {
                    setEditingReservation({
                      ...editingReservation,
                      status: e.target.value as "COMPLETED" | "CANCELLED" | "PENDING_PAYMENT" | "CONFIRMED" | "WAITING_CONFIRMATION" | "REJECTED"
                    })
                  }}
                  aria-label="Reservation Status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                >
                  <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                  <option value="WAITING_CONFIRMATION">WAITING_CONFIRMATION</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingReservation(null)
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Food Order Modal */}
      {showFoodEditModal && editingFoodOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Edit Food Order</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order ID
                </label>
                <input
                  type="text"
                  value={editingFoodOrder.id}
                  disabled
                  aria-label="Order ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer
                </label>
                <input
                  type="text"
                  value={editingFoodOrder.user_name || 'N/A'}
                  disabled
                  aria-label="Customer Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Items
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 bg-gray-50">
                  {editingFoodOrder.items?.map((item, idx) => (
                    <div key={idx} className="text-sm text-gray-700">
                      {item.qty}x {item.menu_item_name || 'Item'} - Rp {parseFloat(item.price).toLocaleString('id-ID')}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount
                </label>
                <input
                  type="text"
                  value={`Rp ${parseFloat(editingFoodOrder.total_amount).toLocaleString('id-ID')}`}
                  disabled
                  aria-label="Total Amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editingFoodOrder.status}
                  onChange={(e) => {
                    setEditingFoodOrder({
                      ...editingFoodOrder,
                      status: e.target.value as FoodOrder['status']
                    })
                  }}
                  aria-label="Food Order Status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="COOKING">COOKING</option>
                  <option value="DELIVERING">DELIVERING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveFoodEdit}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowFoodEditModal(false)
                  setEditingFoodOrder(null)
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
