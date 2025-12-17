import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { foodService } from "../services/food.service"
import { useAuth } from "../context/AuthContext"
import Footer from "../components/Footer"
import type { MenuItem, CartItem } from "../types/food"

// Import local food images
import ayamGeprek from '../assets/AyamGeprek.jpg'
import burgerBeef from '../assets/BurgerBeef.jpg'
import chickenWings from '../assets/ChickenWings.jpg'
import cocaCola from '../assets/CocaCola.jpg'
import esJeruk from '../assets/EsJeruk.jpg'
import esTeh from '../assets/EsTeh.jpg'
import frenchFries from '../assets/FrenchFries.jpg'
import kopiSusu from '../assets/KopiSusu.jpg'
import mieGoreng from '../assets/MieGoreng.jpg'
import mineralWater from '../assets/MineralWater.jpg'
import nachos from '../assets/Nachos.jpg'
import nasiGoreng from '../assets/NasiGoreng.jpg'
import popcorn from '../assets/Popcorn.jpg'
import potatoWedges from '../assets/PotatoWedges.jpg'

export default function FoodMenu() {
  const navigate = useNavigate()
  const { user } = useAuth()
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
    // Require login to add to cart
    if (!user) {
      navigate('/login', { state: { from: '/food' } })
      return
    }
    
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
    if (!user) {
      navigate('/login', { state: { from: '/food' } })
      return
    }
    if (cart.length === 0) return
    navigate("/food/checkout", { state: { cart } })
  }

  // Get local images based on item name
  const getPlaceholderImage = (item: MenuItem, index: number) => {
    const itemName = item.name.toLowerCase()
    
    // Match by item name first
    if (itemName.includes('ayam geprek') || itemName.includes('geprek')) return ayamGeprek
    if (itemName.includes('burger')) return burgerBeef
    if (itemName.includes('chicken wings') || itemName.includes('sayap ayam')) return chickenWings
    if (itemName.includes('coca cola') || itemName.includes('coke')) return cocaCola
    if (itemName.includes('es jeruk') || itemName.includes('jeruk peras')) return esJeruk
    if (itemName.includes('es teh') || itemName.includes('teh manis')) return esTeh
    if (itemName.includes('french fries') || itemName.includes('kentang goreng')) return frenchFries
    if (itemName.includes('kopi susu') || itemName.includes('coffee')) return kopiSusu
    if (itemName.includes('mie goreng')) return mieGoreng
    if (itemName.includes('mineral water') || itemName.includes('air mineral')) return mineralWater
    if (itemName.includes('nachos')) return nachos
    if (itemName.includes('nasi goreng')) return nasiGoreng
    if (itemName.includes('popcorn')) return popcorn
    if (itemName.includes('potato wedges') || itemName.includes('wedges')) return potatoWedges
    
    // Fallback by category
    if (item.category === "FOOD") {
      const foodImages = [burgerBeef, ayamGeprek, nasiGoreng, mieGoreng]
      return foodImages[index % foodImages.length]
    } else if (item.category === "DRINK" || item.category === "BEVERAGE") {
      const drinkImages = [esTeh, esJeruk, kopiSusu, cocaCola, mineralWater]
      return drinkImages[index % drinkImages.length]
    } else {
      // SNACK category
      const snackImages = [frenchFries, chickenWings, nachos, popcorn, potatoWedges]
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
                        title={!user ? "Login to add to cart" : ""}
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
                <span>{!user ? "Login to Checkout" : "Checkout"}</span>
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
