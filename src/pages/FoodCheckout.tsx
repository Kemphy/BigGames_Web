import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { foodService } from "../services/food.service"
import { roomService } from "../services/room.service"
import type { CartItem } from "../types/food"
import type { Room } from "../types/api"

export default function FoodCheckout() {
  const navigate = useNavigate()
  const location = useLocation()
  const cart = (location.state?.cart as CartItem[]) || []
  
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (cart.length === 0) {
      navigate("/food")
      return
    }
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      const response = await roomService.getRooms({ pageSize: 50 })
      setRooms(response.rooms)
      if (response.rooms.length > 0) {
        setSelectedRoom(response.rooms[0].id)
      }
    } catch (error) {
      console.error("Failed to load rooms:", error)
    }
  }

  const updateQuantity = (itemId: string, delta: number) => {
    const updatedCart = cart.map(i => {
      if (i.menu_item.id === itemId) {
        const newQty = Math.max(0, i.quantity + delta)
        return { ...i, quantity: newQty }
      }
      return i
    }).filter(i => i.quantity > 0)

    if (updatedCart.length === 0) {
      navigate("/food")
    } else {
      navigate("/food/checkout", { state: { cart: updatedCart }, replace: true })
    }
  }

  const removeItem = (itemId: string) => {
    const updatedCart = cart.filter(i => i.menu_item.id !== itemId)
    if (updatedCart.length === 0) {
      navigate("/food")
    } else {
      navigate("/food/checkout", { state: { cart: updatedCart }, replace: true })
    }
  }

  const getSubtotal = () => cart.reduce(
    (sum, item) => sum + (parseFloat(item.menu_item.price) * item.quantity),
    0
  )

  const deliveryFee = 0
  const total = getSubtotal() + deliveryFee

  const handlePlaceOrder = async () => {
    if (!selectedRoom) {
      alert("Pilih ruangan untuk pengiriman")
      return
    }

    setLoading(true)
    try {
      const orderData = {
        room_id: selectedRoom,
        notes: notes || undefined,
        items: cart.map(item => ({
          menu_item_id: item.menu_item.id,
          qty: item.quantity
        }))
      }

      const order = await foodService.createOrder(orderData)
      navigate("/food/success", { state: { order } })
    } catch (error: any) {
      alert(error.message || "Failed to place order")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const selectedRoomData = rooms.find(r => r.id === selectedRoom)

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-white">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Delivery & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Location */}
            <div className="bg-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Deliver to</h2>
                <button type="button" aria-label="Change location" className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                aria-label="Select room"
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              >
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Add a note of delivery address"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={3}
              />
            </div>

            {/* My Bucket */}
            <div className="bg-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">My Bucket</h2>
                <button className="text-red-500 text-sm font-medium">+ Add items</button>
              </div>

              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.menu_item.id} className="flex items-center gap-4">
                    <img
                      src={item.menu_item.image_url || "https://placehold.co/80?text=No+Image"}
                      alt={item.menu_item.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-bold mb-1">{item.menu_item.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-red-500 font-bold">
                          {parseFloat(item.menu_item.price).toLocaleString()}
                        </span>
                        <span className="text-slate-500 text-sm line-through">
                          {(parseFloat(item.menu_item.price) * 1.2).toLocaleString()}
                        </span>
                      </div>
                      {item.menu_item.free_delivery && (
                        <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full inline-block mt-1">
                          Free delivery
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => removeItem(item.menu_item.id)}
                        aria-label="Remove item"
                        className="text-red-500 hover:text-red-400"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      <div className="flex items-center gap-2 bg-slate-700 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.menu_item.id, -1)}
                          className="w-8 h-8 text-white hover:bg-slate-600 rounded-l-lg flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-white font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menu_item.id, 1)}
                          className="w-8 h-8 bg-red-500 text-white hover:bg-red-600 rounded-r-lg flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Payment */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-2xl p-6 sticky top-8">
              <h2 className="text-lg font-bold text-white mb-6">Payment</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-300">
                  <span>Item total</span>
                  <span className="font-bold">Rp {getSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Delivery fee</span>
                  <span className="font-bold">Rp {deliveryFee}</span>
                </div>
                <div className="border-t border-slate-700 pt-3">
                  <div className="flex justify-between text-white text-lg">
                    <span className="font-bold">To Pay</span>
                    <span className="font-bold text-red-500">Rp {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-red-500 text-white py-4 rounded-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Placing order..." : `Place order • Rp ${total.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
