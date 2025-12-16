import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { foodService } from "../services/food.service"
import Footer from "../components/Footer"
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

  // Get varied placeholder images - different for each item
  const getPlaceholderImage = (item: MenuItem, index: number) => {
    // Food category images
    const foodImages = [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop", // Burger
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop", // Pizza
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop", // Salad
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=300&fit=crop", // Pancakes
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=300&h=300&fit=crop", // Ramen
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&h=300&fit=crop", // Pasta
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=300&fit=crop", // Steak
      "https://images.unsplash.com/photo-1562967914-608f82629710?w=300&h=300&fit=crop", // Sushi
    ]
    
    // Drink/Beverage category images
    const drinkImages = [
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=300&fit=crop", // Coffee
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=300&fit=crop", // Iced Coffee
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=300&h=300&fit=crop", // Juice
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=300&fit=crop", // Smoothie
      "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=300&h=300&fit=crop", // Milk Tea
      "https://images.unsplash.com/photo-1576098359692-63a1e8dc5e2d?w=300&h=300&fit=crop", // Iced Tea
      "https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=300&h=300&fit=crop", // Frappe
    ]
    
    // Snack category images
    const snackImages = [
      "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300&h=300&fit=crop", // Fries
      "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=300&h=300&fit=crop", // Chicken Wings
      "https://images.unsplash.com/photo-1562967916-ca8817ee80c0?w=300&h=300&fit=crop", // Nachos
      "https://images.unsplash.com/photo-1560717845-968823efbee1?w=300&h=300&fit=crop", // Popcorn
      "https://images.unsplash.com/photo-1613588555091-97ba5d0c7df2?w=300&h=300&fit=crop", // Onion Rings
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300&h=300&fit=crop", // Sandwich
    ]
    
    if (item.category === "FOOD") {
      return foodImages[index % foodImages.length]
    } else if (item.category === "DRINK" || item.category === "BEVERAGE") {
      return drinkImages[index % drinkImages.length]
    } else {
      return snackImages[index % snackImages.length]
    }
  }

  const categories = ["ALL", "FOOD", "BEVERAGE", "SNACK"]

  return (
    <div className="min-h-screen bg-slate-900 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Today's Menu</h1>
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
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-slate-800 rounded-2xl p-4 flex items-center gap-4 border border-slate-700 animate-pulse">
                <div className="w-24 h-24 bg-slate-700 rounded-xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-700 rounded w-full"></div>
                  <div className="h-6 bg-slate-700 rounded w-1/4"></div>
                </div>
                <div className="w-10 h-10 bg-slate-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item, index) => {
              const inCart = cart.find(i => i.menu_item.id === item.id)
              return (
                <div key={item.id} className="bg-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:bg-slate-750 transition-colors border border-slate-700">
                  {/* Image */}
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <img 
                      src={item.image_url || getPlaceholderImage(item, index)} 
                      alt={item.name}
                      className="w-full h-full rounded-xl object-cover shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = getPlaceholderImage(item, index)
                      }}
                    />
                    {!item.is_active && (
                      <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xs font-bold">Habis</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white flex-1">{item.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        item.category === 'FOOD' ? 'bg-orange-500/20 text-orange-400' :
                        item.category === 'DRINK' ? 'bg-blue-500/20 text-blue-400' :
                        item.category === 'BEVERAGE' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {item.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2 line-clamp-2">{item.description || 'Deskripsi tidak tersedia'}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg font-bold text-white">
                        Rp {parseFloat(item.price).toLocaleString()}
                      </span>
                      {item.free_delivery && (
                        <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full font-medium">
                          🚚 Free delivery
                        </span>
                      )}
                      {item.stock > 0 && item.stock < 10 && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full font-medium">
                          Stok terbatas: {item.stock}
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
                        disabled={!item.is_active}
                        className={`w-10 h-10 text-white rounded-lg transition-colors flex items-center justify-center ${
                          item.is_active 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-slate-600 cursor-not-allowed opacity-50'
                        }`}
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
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-bold text-white mb-2">Tidak ada menu tersedia</h3>
                <p className="text-slate-400">Coba filter atau kata kunci pencarian lainnya</p>
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
      
      <Footer />
    </div>
  )
}
