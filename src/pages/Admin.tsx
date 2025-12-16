import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { adminService, type AdminReservation } from "../services/admin.service"
import { roomService } from "../services/room.service"
import { foodService } from "../services/food.service"
import { reservationService } from "../services/reservation.service"
import type { FoodOrder } from "../types/food"
import Toast, { type ToastType } from "../components/Toast"

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
  const [activeTab, setActiveTab] = useState<"reservations" | "food" | "schedule">("reservations")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [editingReservation, setEditingReservation] = useState<AdminReservation | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isViewMode, setIsViewMode] = useState(false)
  const [editingFoodOrder, setEditingFoodOrder] = useState<FoodOrder | null>(null)
  const [showFoodEditModal, setShowFoodEditModal] = useState(false)
  const [isFoodViewMode, setIsFoodViewMode] = useState(false)
  
  // Confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    title: string
    message: string
    onConfirm: () => void
    type: 'complete' | 'cancel' | 'delete'
  } | null>(null)
  
  // Toast notification states
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const showToast = (message: string, type: ToastType) => setToast({ message, type })
  
  // Sorting states
  const [sortField, setSortField] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [foodSortField, setFoodSortField] = useState<string>('created_at')
  const [foodSortDirection, setFoodSortDirection] = useState<'asc' | 'desc'>('desc')

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
    showConfirmation(
      `${action === 'approve' ? 'Approve' : 'Reject'} Payment`,
      `Yakin ingin ${action === 'approve' ? 'menyetujui' : 'menolak'} pembayaran ini?`,
      async () => {
        try {
          if (action === "approve") {
            await adminService.confirmPayment(paymentId)
          } else {
            await adminService.rejectPayment(paymentId)
          }
          showToast(`Pembayaran berhasil di${action === 'approve' ? 'setujui' : 'tolak'}`, 'success')
          loadData()
        } catch (err: any) {
          showToast(`Gagal ${action === 'approve' ? 'menyetujui' : 'menolak'} pembayaran`, 'error')
          console.error(err)
        }
      },
      action === 'approve' ? 'complete' : 'cancel'
    )
  }

  const showConfirmation = (title: string, message: string, onConfirm: () => void, type: 'complete' | 'cancel' | 'delete') => {
    setConfirmAction({ title, message, onConfirm, type })
    setShowConfirmModal(true)
  }

  const handleConfirm = async () => {
    if (confirmAction) {
      await confirmAction.onConfirm()
      setShowConfirmModal(false)
      setConfirmAction(null)
    }
  }

  const handleUpdateStatus = async (reservationId: string, newStatus: string) => {
    try {
      await adminService.updateReservationStatus(reservationId, newStatus)
      showToast("Status berhasil diperbarui", 'success')
      loadData()
    } catch (err: any) {
      showToast("Gagal memperbarui status", 'error')
      console.error(err)
    }
  }

  const handleCancelReservation = async (id: string) => {
    try {
      await adminService.cancelReservation(id)
      showToast("Reservasi berhasil dibatalkan", 'success')
      loadData()
    } catch (err: any) {
      console.error("Cancel error:", err)
      const errorMsg = err?.response?.data?.detail || err?.message || "Gagal membatalkan reservasi"
      showToast(errorMsg, 'error')
    }
  }

  const handleUpdateFoodStatus = async (orderId: string, newStatus: string) => {
    try {
      await foodService.updateOrderStatus(orderId, newStatus)
      showToast("Status pesanan berhasil diperbarui", 'success')
      loadData()
    } catch (err: any) {
      showToast("Gagal memperbarui status pesanan", 'error')
      console.error(err)
    }
  }

  const handleCancelFoodOrder = async (id: string) => {
    try {
      await foodService.updateOrderStatus(id, "CANCELLED")
      showToast("Pesanan makanan berhasil dibatalkan", 'success')
      loadData()
    } catch (err: any) {
      showToast("Gagal membatalkan pesanan makanan", 'error')
      console.error(err)
    }
  }

  const handleEditReservation = (reservation: AdminReservation) => {
    handleViewEditReservation(reservation, false)
  }

  const handleViewEditReservation = (reservation: AdminReservation, viewOnly: boolean = false) => {
    setEditingReservation(reservation)
    setIsViewMode(viewOnly)
    setShowEditModal(true)
  }

  const handleDeleteReservation = async (id: string) => {
    try {
      await adminService.deleteReservation(id)
      showToast("Reservasi berhasil dihapus permanen", 'success')
      loadData()
    } catch (err: any) {
      console.error("Delete error:", err)
      const errorMsg = err?.response?.data?.detail || err?.message || "Gagal menghapus reservasi"
      
      if (err?.response?.status === 404) {
        showToast("Endpoint DELETE belum tersedia di backend", 'error')
      } else {
        showToast(`Gagal menghapus: ${errorMsg}`, 'error')
      }
    }
  }

  const handleSaveEdit = async () => {
    if (!editingReservation) return
    
    try {
      // Calculate end_time from start_time + duration_hours
      const startTime = new Date(editingReservation.start_time)
      const durationHours = parseFloat(editingReservation.duration_hours)
      const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000)
      
      // Use adminService to update full reservation data
      // Note: API expects start_time, end_time, not duration_hours
      await adminService.updateReservation(editingReservation.id, {
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
      })
      showToast("Reservasi berhasil diperbarui", 'success')
      setShowEditModal(false)
      setEditingReservation(null)
      loadData()
    } catch (err: any) {
      showToast("Gagal memperbarui reservasi", 'error')
      console.error(err)
    }
  }

  const handleViewEditFoodOrder = (order: FoodOrder, viewOnly: boolean = false) => {
    setEditingFoodOrder(order)
    setIsFoodViewMode(viewOnly)
    setShowFoodEditModal(true)
  }

  const handleEditFoodOrder = (order: FoodOrder) => {
    handleViewEditFoodOrder(order, false)
  }

  const handleDeleteFoodOrder = async (id: string) => {
    try {
      await foodService.updateOrderStatus(id, "CANCELLED")
      showToast("Pesanan makanan berhasil dihapus", 'success')
      loadData()
    } catch (err: any) {
      showToast("Gagal menghapus pesanan makanan", 'error')
      console.error(err)
    }
  }

  const handleSaveFoodEdit = async () => {
    if (!editingFoodOrder) return
    
    try {
      await foodService.updateOrderStatus(editingFoodOrder.id, editingFoodOrder.status)
      showToast("Pesanan makanan berhasil diperbarui", 'success')
      setShowFoodEditModal(false)
      setEditingFoodOrder(null)
      loadData()
    } catch (err: any) {
      showToast("Gagal memperbarui pesanan makanan", 'error')
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

  // Sorting functions
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handleFoodSort = (field: string) => {
    if (foodSortField === field) {
      setFoodSortDirection(foodSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setFoodSortField(field)
      setFoodSortDirection('desc')
    }
  }

  const filteredReservations = reservations
    .filter(r => {
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
    .sort((a, b) => {
      let aVal: any, bVal: any
      
      if (sortField === 'created_at' || sortField === 'start_time') {
        aVal = new Date(a[sortField] as string).getTime()
        bVal = new Date(b[sortField] as string).getTime()
      } else if (sortField === 'total_amount') {
        aVal = parseFloat(a.total_amount)
        bVal = parseFloat(b.total_amount)
      } else if (sortField === 'user_name') {
        aVal = (a.user_name || a.user?.name || '').toLowerCase()
        bVal = (b.user_name || b.user?.name || '').toLowerCase()
      } else {
        aVal = ((a as any)[sortField] || '').toString().toLowerCase()
        bVal = ((b as any)[sortField] || '').toString().toLowerCase()
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

  const filteredFoodOrders = foodOrders
    .filter(o => foodFilter === "ALL" || o.status === foodFilter)
    .sort((a, b) => {
      let aVal: any, bVal: any
      
      if (foodSortField === 'created_at') {
        aVal = new Date(a.created_at).getTime()
        bVal = new Date(b.created_at).getTime()
      } else if (foodSortField === 'total_amount') {
        aVal = parseFloat(a.total_amount)
        bVal = parseFloat(b.total_amount)
      } else {
        aVal = ((a as any)[foodSortField] || '').toString().toLowerCase()
        bVal = ((b as any)[foodSortField] || '').toString().toLowerCase()
      }
      
      if (aVal < bVal) return foodSortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return foodSortDirection === 'asc' ? 1 : -1
      return 0
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
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/')} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
            <button onClick={() => logout()} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              Logout
            </button>
          </div>
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
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <button
                onClick={() => setActiveTab("schedule")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "schedule"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                📅 Daily Schedule
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
                    <th 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('user_name')}
                    >
                      <div className="flex items-center gap-1">
                        Customer
                        {sortField === 'user_name' && (
                          <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-28">Room</th>
                    <th 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('start_time')}
                    >
                      <div className="flex items-center gap-1">
                        Date/Time
                        {sortField === 'start_time' && (
                          <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Duration</th>
                    <th 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('total_amount')}
                    >
                      <div className="flex items-center gap-1">
                        Total
                        {sortField === 'total_amount' && (
                          <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-28 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {sortField === 'status' && (
                          <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
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
                          <div className="flex flex-col gap-1">
                            {/* Approve/Reject for payments */}
                            {(reservation.payment_status === "WAITING_CONFIRMATION" || reservation.status === "PENDING_PAYMENT") && reservation.payment && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => reservation.payment && handleVerifyPayment(reservation.payment.id, "approve")}
                                  className="flex-1 px-2 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-xs font-medium shadow-sm border border-green-200"
                                  title="Approve Payment"
                                >
                                  <span className="flex items-center justify-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Approve
                                  </span>
                                </button>
                                <button
                                  onClick={() => reservation.payment && handleVerifyPayment(reservation.payment.id, "reject")}
                                  className="flex-1 px-2 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-xs font-medium shadow-sm border border-red-200"
                                  title="Reject Payment"
                                >
                                  <span className="flex items-center justify-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Reject
                                  </span>
                                </button>
                                {reservation.payment?.payment_proof_url && (
                                  <a
                                    href={reservation.payment.payment_proof_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs font-medium shadow-sm border border-blue-200"
                                    title="View Proof"
                                  >
                                    <svg className="w-3 h-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </a>
                                )}
                              </div>
                            )}
                            
                            {/* Confirm button for PENDING_PAYMENT status */}
                            {reservation.status === "PENDING_PAYMENT" && !reservation.payment && (
                              <button
                                onClick={() => showConfirmation(
                                  'Confirm Reservation',
                                  `Konfirmasi reservasi ${reservation.user_name} menjadi CONFIRMED?`,
                                  () => handleUpdateStatus(reservation.id, "CONFIRMED"),
                                  'complete'
                                )}
                                className="w-full px-2 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-xs font-medium shadow-sm border border-green-200"
                                title="Confirm"
                              >
                                <span className="flex items-center justify-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Confirm
                                </span>
                              </button>
                            )}
                            
                            {/* Complete button for CONFIRMED status */}
                            {reservation.status === "CONFIRMED" && (
                              <button
                                onClick={() => showConfirmation(
                                  'Complete Reservation',
                                  `Ubah status reservasi ${reservation.user_name} menjadi COMPLETED?`,
                                  () => handleUpdateStatus(reservation.id, "COMPLETED"),
                                  'complete'
                                )}
                                className="w-full px-2 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-xs font-medium shadow-sm border border-green-200"
                                title="Complete"
                              >
                                <span className="flex items-center justify-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Complete
                                </span>
                              </button>
                            )}
                            
                            <div className="flex gap-1">
                              {/* View & Edit button */}
                              <button
                                onClick={() => handleViewEditReservation(reservation, false)}
                                className="flex-1 px-2 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs font-medium shadow-sm border border-blue-200"
                                title="View & Edit"
                              >
                                <span className="flex items-center justify-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </span>
                              </button>
                              
                              {/* Cancel button (for non-completed/cancelled reservations) */}
                              {reservation.status !== "COMPLETED" && reservation.status !== "CANCELLED" && reservation.status !== "REJECTED" && (
                                <button
                                  onClick={() => showConfirmation(
                                    'Cancel Reservation',
                                    `Batalkan reservasi ${reservation.user_name}?`,
                                    () => handleCancelReservation(reservation.id),
                                    'cancel'
                                  )}
                                  className="flex-1 px-2 py-1.5 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors text-xs font-medium shadow-sm border border-orange-200"
                                  title="Cancel"
                                >
                                  <span className="flex items-center justify-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel
                                  </span>
                                </button>
                              )}
                            </div>
                            
                            {/* Delete button */}
                            <button
                              onClick={() => showConfirmation(
                                'Delete Reservation',
                                `Hapus reservasi ${reservation.user_name}? Tindakan ini tidak dapat dibatalkan.`,
                                () => handleDeleteReservation(reservation.id),
                                'delete'
                              )}
                              className="w-full px-2 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-xs font-medium shadow-sm border border-red-200"
                              title="Delete"
                            >
                              <span className="flex items-center justify-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </span>
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
              Showing {filteredFoodOrders.length} of {foodOrders.length} orders
              {foodFilter !== "ALL" && ` with status: ${foodFilter}`}
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading orders...</p>
              </div>
            ) : filteredFoodOrders.length > 0 ? (
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">ID</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Room</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-40">Items</th>
                    <th 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-28 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleFoodSort('created_at')}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        {foodSortField === 'created_at' && (
                          <span className="text-blue-600">{foodSortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleFoodSort('total_amount')}
                    >
                      <div className="flex items-center gap-1">
                        Total
                        {foodSortField === 'total_amount' && (
                          <span className="text-blue-600">{foodSortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleFoodSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {foodSortField === 'status' && (
                          <span className="text-blue-600">{foodSortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFoodOrders.map((order) => {
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
                          <div className="flex flex-col gap-1">
                            {["PENDING", "COOKING", "DELIVERING"].includes(order.status) && (
                              <button
                                onClick={() => showConfirmation(
                                  'Complete Order',
                                  `Tandai pesanan sebagai selesai?`,
                                  () => handleUpdateFoodStatus(order.id, "COMPLETED"),
                                  'complete'
                                )}
                                className="w-full px-2 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-xs font-medium shadow-sm border border-green-200"
                                title="Complete"
                              >
                                <span className="flex items-center justify-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Complete
                                </span>
                              </button>
                            )}
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleViewEditFoodOrder(order, false)}
                                className="flex-1 px-2 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs font-medium shadow-sm border border-blue-200"
                                title="View & Edit"
                              >
                                <span className="flex items-center justify-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </span>
                              </button>
                              {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                                <button
                                  onClick={() => showConfirmation(
                                    'Cancel Order',
                                    `Batalkan pesanan untuk ${order.room_name || 'room ini'}?`,
                                    () => handleCancelFoodOrder(order.id),
                                    'cancel'
                                  )}
                                  className="flex-1 px-2 py-1.5 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors text-xs font-medium shadow-sm border border-orange-200"
                                  title="Cancel"
                                >
                                  <span className="flex items-center justify-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel
                                  </span>
                                </button>
                              )}
                            </div>
                            <button
                              onClick={() => showConfirmation(
                                'Delete Order',
                                `Hapus pesanan ini? Tindakan ini tidak dapat dibatalkan.`,
                                () => handleDeleteFoodOrder(order.id),
                                'delete'
                              )}
                              className="w-full px-2 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-xs font-medium shadow-sm border border-red-200"
                              title="Delete"
                            >
                              <span className="flex items-center justify-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </span>
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

      {/* View/Edit Reservation Modal */}
      {showEditModal && editingReservation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto transform scale-100 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {isViewMode ? 'View' : 'Edit'} Reservation
              </h3>
              <button
                onClick={() => setIsViewMode(!isViewMode)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                {isViewMode ? '✏️ Edit' : '👁️ View'}
              </button>
            </div>
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
                  Reservation ID
                </label>
                <input
                  type="text"
                  value={editingReservation.id}
                  disabled
                  aria-label="Reservation ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 font-mono text-xs"
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
                  disabled={isViewMode}
                  onChange={(e) => {
                    const newStartTime = new Date(e.target.value).toISOString()
                    setEditingReservation({
                      ...editingReservation,
                      start_time: newStartTime
                    })
                  }}
                  aria-label="Start Time"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isViewMode ? 'bg-gray-50 text-gray-500' : 'text-gray-900'}`}
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
                  value={editingReservation.duration_hours ? Math.floor(parseFloat(editingReservation.duration_hours)) : 1}
                  disabled={isViewMode}
                  onChange={(e) => {
                    const value = e.target.value
                    setEditingReservation({
                      ...editingReservation,
                      duration_hours: value ? parseFloat(value).toString() : '1'
                    })
                  }}
                  aria-label="Duration in hours"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isViewMode ? 'bg-gray-50 text-gray-500' : 'text-gray-900'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="text"
                  value={new Date(editingReservation.end_time).toLocaleString('id-ID')}
                  disabled
                  aria-label="End Time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount
                </label>
                <input
                  type="text"
                  value={`Rp ${parseFloat(editingReservation.total_amount).toLocaleString('id-ID')}`}
                  disabled
                  aria-label="Total Amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <input
                  type="text"
                  value={editingReservation.payment_status || 'N/A'}
                  disabled
                  aria-label="Payment Status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editingReservation.status}
                  disabled={isViewMode}
                  onChange={(e) => {
                    setEditingReservation({
                      ...editingReservation,
                      status: e.target.value as "COMPLETED" | "CANCELLED" | "PENDING_PAYMENT" | "CONFIRMED" | "WAITING_CONFIRMATION" | "REJECTED"
                    })
                  }}
                  aria-label="Reservation Status"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isViewMode ? 'bg-gray-50 text-gray-500' : 'text-gray-900'}`}
                >
                  <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                  <option value="WAITING_CONFIRMATION">WAITING_CONFIRMATION</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created At
                </label>
                <input
                  type="text"
                  value={new Date(editingReservation.created_at).toLocaleString('id-ID')}
                  disabled
                  aria-label="Created At"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
            </div>
            {!isViewMode && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingReservation(null)
                    setIsViewMode(false)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
            {isViewMode && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingReservation(null)
                    setIsViewMode(false)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View/Edit Food Order Modal */}
      {showFoodEditModal && editingFoodOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto transform scale-100 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {isFoodViewMode ? 'View' : 'Edit'} Food Order
              </h3>
              <button
                onClick={() => setIsFoodViewMode(!isFoodViewMode)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                {isFoodViewMode ? '✏️ Edit' : '👁️ View'}
              </button>
            </div>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order ID
                </label>
                <input
                  type="text"
                  value={editingFoodOrder.id}
                  disabled
                  aria-label="Order ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 font-mono text-xs"
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
                  Room
                </label>
                <input
                  type="text"
                  value={editingFoodOrder.room_name || 'N/A'}
                  disabled
                  aria-label="Room Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Items
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3 bg-gray-50 space-y-1">
                  {editingFoodOrder.items?.map((item, idx) => (
                    <div key={idx} className="text-sm text-gray-700 flex justify-between">
                      <span>{item.qty}x {item.menu_item_name || 'Item'}</span>
                      <span className="font-medium">Rp {parseFloat(item.price).toLocaleString('id-ID')}</span>
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
                  Notes
                </label>
                <textarea
                  value={editingFoodOrder.notes || '-'}
                  disabled
                  aria-label="Order Notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editingFoodOrder.status}
                  disabled={isFoodViewMode}
                  onChange={(e) => {
                    setEditingFoodOrder({
                      ...editingFoodOrder,
                      status: e.target.value as FoodOrder['status']
                    })
                  }}
                  aria-label="Food Order Status"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isFoodViewMode ? 'bg-gray-50 text-gray-500' : 'text-gray-900'}`}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="COOKING">COOKING</option>
                  <option value="DELIVERING">DELIVERING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created At
                </label>
                <input
                  type="text"
                  value={new Date(editingFoodOrder.created_at).toLocaleString('id-ID')}
                  disabled
                  aria-label="Created At"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
            </div>
            {!isFoodViewMode && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveFoodEdit}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowFoodEditModal(false)
                    setEditingFoodOrder(null)
                    setIsFoodViewMode(false)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
            {isFoodViewMode && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowFoodEditModal(false)
                    setEditingFoodOrder(null)
                    setIsFoodViewMode(false)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Daily Schedule View */}
      {activeTab === "schedule" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Jadwal Booking Harian</h2>
                <p className="text-sm text-gray-600 mt-1">Lihat ketersediaan ruangan per jam untuk booking walk-in</p>
              </div>
              
              <div className="flex gap-3 items-center">
                <button
                  onClick={() => {
                    const date = new Date(selectedDate)
                    date.setDate(date.getDate() - 1)
                    setSelectedDate(date.toISOString().split('T')[0])
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  ← Prev
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  aria-label="Select date for schedule view"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                />
                <button
                  onClick={() => {
                    const date = new Date(selectedDate)
                    date.setDate(date.getDate() + 1)
                    setSelectedDate(date.toISOString().split('T')[0])
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Next →
                </button>
                <button
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Today
                </button>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              Menampilkan jadwal untuk: <span className="font-semibold text-gray-900">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          <div className="overflow-x-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading schedule...</p>
              </div>
            ) : (() => {
              // Filter reservations for selected date
              const selectedDateObj = new Date(selectedDate + 'T00:00:00')
              const nextDay = new Date(selectedDateObj)
              nextDay.setDate(nextDay.getDate() + 1)
              
              const dayReservations = reservations.filter(r => {
                const startTime = new Date(r.start_time)
                return startTime >= selectedDateObj && startTime < nextDay && 
                       (r.status === 'CONFIRMED' || r.status === 'WAITING_CONFIRMATION' || r.status === 'PENDING_PAYMENT')
              })

              // Get unique rooms
              const rooms = Array.from(new Set(dayReservations.map(r => r.room?.id || r.room_id))).map(roomId => {
                const reservation = dayReservations.find(r => (r.room?.id || r.room_id) === roomId)
                return {
                  id: roomId,
                  name: reservation?.room?.name || reservation?.room_name || `Room ${roomId.slice(0, 8)}`
                }
              })

              // Operating hours: 9 AM to 11 PM (14 hours)
              const hours = Array.from({ length: 14 }, (_, i) => i + 9)

              return (
                <div className="space-y-6">
                  {rooms.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-5xl mb-4">📅</div>
                      <p className="text-gray-600 font-medium">Tidak ada booking untuk tanggal ini</p>
                      <p className="text-gray-500 text-sm mt-2">Semua ruangan tersedia</p>
                    </div>
                  ) : (
                    rooms.map(room => {
                      const roomReservations = dayReservations.filter(r => 
                        (r.room?.id || r.room_id) === room.id
                      )

                      return (
                        <div key={room.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                            <h3 className="text-white font-semibold text-lg">{room.name}</h3>
                          </div>
                          
                          <div className="p-4">
                            <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
                              {hours.map(hour => {
                                // Check if this hour is booked
                                const booking = roomReservations.find(r => {
                                  const start = new Date(r.start_time)
                                  const end = new Date(r.end_time)
                                  const checkTime = new Date(selectedDateObj)
                                  checkTime.setHours(hour, 0, 0, 0)
                                  return checkTime >= start && checkTime < end
                                })

                                return (
                                  <div
                                    key={hour}
                                    className={`relative group`}
                                  >
                                    <div
                                      className={`px-2 py-3 rounded-lg text-center transition-all cursor-pointer ${
                                        booking
                                          ? 'bg-red-100 border-2 border-red-300 hover:bg-red-200'
                                          : 'bg-green-100 border-2 border-green-300 hover:bg-green-200'
                                      }`}
                                    >
                                      <div className="text-xs font-bold text-gray-700">
                                        {hour.toString().padStart(2, '0')}:00
                                      </div>
                                      <div className="text-lg mt-1">
                                        {booking ? '🔴' : '✅'}
                                      </div>
                                    </div>
                                    
                                    {booking && (
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                                          <div className="font-semibold">{booking.user_name}</div>
                                          <div className="text-gray-300 mt-1">
                                            {new Date(booking.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - 
                                            {new Date(booking.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                          </div>
                                          <div className="text-gray-400 text-xs mt-1">
                                            {Math.floor(parseFloat(booking.duration_hours))} jam - Rp {(parseFloat(booking.total_amount) / 1000).toFixed(0)}k
                                          </div>
                                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                            <div className="border-4 border-transparent border-t-gray-900"></div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-6 py-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 border-2 border-green-300 rounded flex items-center justify-center">✅</div>
                      <span className="text-sm font-medium text-gray-700">Tersedia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-100 border-2 border-red-300 rounded flex items-center justify-center">🔴</div>
                      <span className="text-sm font-medium text-gray-700">Sudah Dibooking</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Jam operasional:</span> 09:00 - 23:00
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform scale-100 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              {confirmAction.type === 'complete' && (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {confirmAction.type === 'cancel' && (
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              {confirmAction.type === 'delete' && (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {confirmAction.title}
            </h3>
            
            <p className="text-gray-600 text-center mb-6">
              {confirmAction.message}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false)
                  setConfirmAction(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium text-white ${
                  confirmAction.type === 'complete' ? 'bg-green-600 hover:bg-green-700' :
                  confirmAction.type === 'cancel' ? 'bg-yellow-600 hover:bg-yellow-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmAction.type === 'complete' ? 'Ya, Complete' :
                 confirmAction.type === 'cancel' ? 'Ya, Cancel' :
                 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
