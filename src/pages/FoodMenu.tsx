import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { foodService } from "../services/food.service"
import type { MenuItem, CartItem } from "../types/food"

export default function FoodMenu() {
  const navigate = useNavigate()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [filter, setFilter] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadMenu()
  }, [filter])

  const loadMenu = async () => {
    setLoading(true)
    try {
      const items = await foodService.getMenuItems({
        category: filter === "ALL" ? undefined : (filter as any)
      })
      setMenuItems(items)
    } catch (error) {
      console.error("Failed to load menu:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  )

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(i => i.menu_item.id === item.id)
    if (existingItem) {
      setCart(cart.map(i => 
        i.menu_item.id === item.id 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ))
    } else {
      setCart([...cart, { menu_item: item, quantity: 1 }])
    }
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(cart.map(i => {
      if (i.menu_item.id === itemId) {
        const newQty = Math.max(0, i.quantity + delta)
        return { ...i, quantity: newQty }
      }
      return i
    }).filter(i => i.quantity > 0))
  }

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(i => i.menu_item.id !== itemId))
  }

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0)
  
  const getTotalPrice = () => cart.reduce(
    (sum, item) => sum + (parseFloat(item.menu_item.price) * item.quantity), 
    0
  )

  const handleCheckout = () => {
    if (cart.length === 0) return
    navigate("/food/checkout", { state: { cart } })
  }

  const categories = ["ALL", "FOOD", "BEVERAGE", "SNACK"]

  return (
    <div className="min-h-screen bg-slate-900 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Today's Promo</h1>
          <p className="text-slate-400">Order makanan & minuman untuk ruangan Anda</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === cat
                  ? "bg-red-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Cari menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-slate-800 text-white rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p className="mt-4 text-slate-400">Loading menu...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const inCart = cart.find(i => i.menu_item.id === item.id)
              return (
                <div key={item.id} className="bg-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:bg-slate-750 transition-colors">
                  {/* Image */}
                  <img 
                    src={item.image_url || "https://placehold.co/120?text=No+Image"} 
                    alt={item.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                    <p className="text-sm text-slate-400 mb-2">{item.description}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-white">
                        Rp {parseFloat(item.price).toLocaleString()}
                      </span>
                      {item.rating && (
                        <div className="flex items-center gap-1 text-yellow-400">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium">{item.rating}</span>
                        </div>
                      )}
                      {item.free_delivery && (
                        <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                          Free delivery
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {inCart ? (
                      <>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                          className="w-8 h-8 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-8 text-center text-white font-bold">{inCart.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                          className="w-8 h-8 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        aria-label="Add to cart"
                        className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">Tidak ada menu tersedia</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Checkout Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <span className="font-bold">{getTotalItems()} Item</span>
              </div>
              <button
                onClick={handleCheckout}
                className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center gap-3"
              >
                <span>Checkout</span>
                <span>Rp {getTotalPrice().toLocaleString()}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
