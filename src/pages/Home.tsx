import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import ConsoleCard from "../components/ConsoleCard"
import Footer from "../components/Footer"
import Logo from "../components/Logo"
import { roomService } from "../services/room.service"
import { aiService, type RecommendedRoom } from "../services/ai.service"
import { useAuth } from "../context/AuthContext"
import type { Room } from "../types/api"
import Toast, { type ToastType } from "../components/Toast"

type Category = "VIP" | "REGULAR" | "SIMULATOR"

interface PromoDetail {
  title: string
  discount: string
  description: string
  validUntil: string
  code: string
  terms: string[]
}

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])
  const [aiRecommendations, setAiRecommendations] = useState<RecommendedRoom[]>([])
  const [isAiColdStart, setIsAiColdStart] = useState(true)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<Category | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedPromo, setSelectedPromo] = useState<PromoDetail | null>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  
  const allRoomsRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Track screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    loadRooms(category)
    loadAiRecommendations()
  }, [category])

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (aiRecommendations.length === 0) return
    
    const itemsPerView = isMobile ? 1 : 3
    const maxSlide = Math.max(0, aiRecommendations.slice(0, 10).length - itemsPerView)
    const interval = setInterval(() => {
      setCurrentSlide((prev) => 
        prev >= maxSlide ? 0 : prev + 1
      )
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [aiRecommendations, isMobile])

  const loadAiRecommendations = async () => {
    try {
      const response = await aiService.getRecommendations({ limit: 10 })
      setAiRecommendations(response.recommendations)
      setIsAiColdStart(response.is_cold_start)
      console.log('[AI] Loaded recommendations:', {
        count: response.recommendations.length,
        coldStart: response.is_cold_start,
        userEvents: response.user_event_count
      })
    } catch (error) {
      console.error("Failed to load AI recommendations:", error)
      // Fallback: show empty array, don't crash the app
      setAiRecommendations([])
    }
  }

  const loadRooms = async (cat?: Category | null) => {
    setLoading(true)
    console.log('[DEBUG] Loading rooms with category:', cat)
    try {
      const response = await roomService.getRooms({
        category: cat || undefined
        // Backend doesn't accept page_size parameter
      })
      console.log('[DEBUG] Rooms response:', {
        category: cat,
        totalRooms: response.rooms.length,
        rooms: response.rooms.map(r => ({ id: r.id, name: r.name, category: r.category }))
      })
      setRooms(response.rooms)
    } catch (error: any) {
      console.error("[ERROR] Failed to load rooms:", {
        category: cat,
        error: error,
        message: error?.message,
        response: error?.response?.data
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = searchQuery === "" || 
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !category || room.category === category
    
    return matchesSearch && matchesCategory
  })

  const handleCategoryClick = (cat: Category) => {
    const newCategory = category === cat ? null : cat
    setCategory(newCategory)
    loadRooms(newCategory)
    allRoomsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleRoomClick = async (roomId: string) => {
    // Log event (non-blocking)
    aiService.logEvent({ room_id: roomId, event_type: "CLICK_ROOM" })
    navigate(`/booking/${roomId}`)
  }

  const categories: { value: Category; label: string; icon: string }[] = [
    { value: "VIP", label: "VIP ROOM", icon: "🎮" },
    { value: "REGULAR", label: "REGULAR ROOM", icon: "🕹️" },
    { value: "SIMULATOR", label: "SIMULATOR", icon: "🏁" },
  ]

  return (
    <div className="bg-slate-900">
      {/* Hero Section with Wave */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden py-6">
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#1e293b" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,122.7C1248,107,1344,85,1392,74.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Selamat Datang,
              </h1>
              <p className="text-xl md:text-2xl font-semibold text-slate-300">
                {user?.name || "Guest"}
              </p>
            </div>
            <Logo className="w-48 h-48 object-contain" variant="circle" />
          </div>

          {/* Category Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleCategoryClick(cat.value)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${
                  category === cat.value
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                }`}
              >
                <div className="text-4xl mb-2">{cat.icon}</div>
                <span className="text-sm font-semibold text-center">{cat.label}</span>
              </button>
            ))}
            <Link
              to="/food"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-200 text-slate-800 hover:bg-slate-300 transition-all"
            >
              <div className="text-4xl mb-2">🍔</div>
              <span className="text-sm font-semibold text-center">F&B</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* AI Recommendations Carousel */}
        <section className="relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Bosen? Ambil Nih Paket Premium Kami!
              </h2>
              {isAiColdStart ? (
                <p className="text-slate-400 text-sm">✨ Trending rooms - Booking lebih banyak untuk rekomendasi personal!</p>
              ) : (
                <p className="text-slate-400 text-sm">🤖 Dipilih khusus untuk Anda berdasarkan preferensi</p>
              )}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-blue-900/20 to-transparent p-6">
            <div 
              ref={carouselRef}
              className="flex transition-transform duration-700 ease-out"
              style={{
                transform: isMobile 
                  ? `translateX(-${currentSlide * 100}%)` 
                  : `translateX(-${currentSlide * (100 / 3)}%)`,
              }}
            >
              {aiRecommendations.slice(0, 10).map((rec) => {
                const room: Room = {
                  id: rec.room_id,
                  name: rec.name,
                  description: rec.description || rec.reason,
                  category: rec.category as Room['category'],
                  capacity: rec.capacity,
                  base_price_per_hour: String(rec.base_price_per_hour),
                  status: 'ACTIVE',
                  created_at: "",
                  images: rec.image_url ? [rec.image_url] : [],
                  units: []
                }
                return (
                  <div 
                    key={rec.room_id} 
                    className="w-full md:w-1/3 flex-shrink-0 px-4"
                  >
                    <div 
                      onClick={() => handleRoomClick(rec.room_id)}
                      className="cursor-pointer transform hover:scale-105 transition-transform"
                    >
                      <ConsoleCard room={room} />
                      <div className="mt-2 px-4">
                        <p className="text-sm text-slate-300 leading-relaxed">{rec.reason}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Navigation Arrows */}
            <button
              type="button"
              onClick={() => {
                const itemsPerView = isMobile ? 1 : 3
                const maxSlide = Math.max(0, aiRecommendations.slice(0, 10).length - itemsPerView)
                setCurrentSlide((prev) => (prev === 0 ? maxSlide : prev - 1))
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors z-10"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                const itemsPerView = isMobile ? 1 : 3
                const maxSlide = Math.max(0, aiRecommendations.slice(0, 10).length - itemsPerView)
                setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1))
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors z-10"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {aiRecommendations.slice(0, 10).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSlide === index 
                      ? 'bg-blue-500 w-8' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Promo Section */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Jangan Sampai Ketinggalan!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              onClick={() => setSelectedPromo({
                title: "First Timer Bonus",
                discount: "50%",
                description: "Diskon 50% untuk booking pertama Anda",
                validUntil: "2 - 10 November 2025",
                code: "FIRSTGAME",
                terms: ["Minimal booking 2 jam", "Berlaku untuk semua room", "Hanya untuk user baru"]
              })}
              className="relative bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-8 overflow-hidden cursor-pointer transform hover:scale-105 transition-all hover:shadow-2xl hover:shadow-cyan-500/50"
            >
              <div className="relative z-10">
                <p className="text-white text-sm mb-2">Privilage pengguna pertama</p>
                <h3 className="text-white text-4xl font-bold mb-4">Diskon 50%!</h3>
                <span className="inline-block bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                  2 - 10 November 2025
                </span>
                <p className="text-white/90 text-xs mt-4">Klik untuk detail lengkap →</p>
              </div>
              <div className="absolute right-0 top-0 w-48 h-48 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute right-8 bottom-8 text-white opacity-20">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>

            <div 
              onClick={() => setSelectedPromo({
                title: "Loyal Member",
                discount: "30%",
                description: "Diskon 30% untuk member setia BigGames",
                validUntil: "2 - 10 Desember 2025",
                code: "LOYAL30",
                terms: ["Minimal 3x booking sebelumnya", "Semua kategori room", "Tidak bisa digabung promo lain"]
              })}
              className="relative bg-gradient-to-r from-blue-500 to-pink-500 rounded-2xl p-8 overflow-hidden cursor-pointer transform hover:scale-105 transition-all hover:shadow-2xl hover:shadow-blue-500/50"
            >
              <div className="relative z-10">
                <p className="text-white text-sm mb-2">Member setia</p>
                <h3 className="text-white text-4xl font-bold mb-4">Diskon 30%!</h3>
                <span className="inline-block bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                  2 - 10 Desember 2025
                </span>
                <p className="text-white/90 text-xs mt-4">Klik untuk detail lengkap →</p>
              </div>
              <div className="absolute right-0 top-0 w-48 h-48 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute right-8 bottom-8 text-white opacity-20">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
              </div>
            </div>

            <div 
              onClick={() => setSelectedPromo({
                title: "Flash Sale",
                discount: "40%",
                description: "Diskon 40% untuk booking hari ini",
                validUntil: "Hari ini saja!",
                code: "FLASH40",
                terms: ["Berlaku untuk hari ini", "Minimal booking 2 jam", "Stok terbatas", "First come first served"]
              })}
              className="relative bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 overflow-hidden cursor-pointer transform hover:scale-105 transition-all hover:shadow-2xl hover:shadow-orange-500/50"
            >
              <div className="relative z-10">
                <p className="text-white text-sm mb-2">Flash sale</p>
                <h3 className="text-white text-4xl font-bold mb-4">Diskon 40%!</h3>
                <span className="inline-block bg-yellow-500 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                  Hari ini saja!
                </span>
                <p className="text-white/90 text-xs mt-4">Klik untuk detail lengkap →</p>
              </div>
              <div className="absolute right-0 top-0 w-48 h-48 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute right-8 bottom-8 text-white opacity-20 animate-pulse">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Promo Detail Modal */}
        {selectedPromo && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPromo(null)}
          >
            <div 
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full border border-blue-500/30 shadow-2xl transform scale-100 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="inline-block bg-gradient-to-r from-blue-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                  {selectedPromo.discount} OFF
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPromo(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <h3 className="text-3xl font-bold text-white mb-4">{selectedPromo.title}</h3>
              <p className="text-gray-300 mb-6">{selectedPromo.description}</p>

              <div className="bg-black/30 rounded-lg p-4 mb-6 border border-blue-500/30">
                <p className="text-xs text-gray-400 mb-1">Kode Promo:</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-mono font-bold text-blue-400">{selectedPromo.code}</p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedPromo.code)
                      setToast({ message: "Kode promo berhasil disalin!", type: 'success' })
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Salin
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Berlaku hingga: {selectedPromo.validUntil}</span>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-sm text-gray-400 mb-3 font-semibold">Syarat & Ketentuan:</p>
                <ul className="space-y-2">
                  {selectedPromo.terms.map((term, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/booking"
                className="mt-6 w-full block text-center bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                Gunakan Sekarang
              </Link>
            </div>
          </div>
        )}

        {/* All Rooms Section */}
        <section ref={allRoomsRef}>
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-slate-400">Loading rooms...</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              {category ? `${category} Rooms` : "Semua Ruangan"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRooms.map((room) => (
                <div key={room.id} onClick={() => handleRoomClick(room.id)}>
                  <ConsoleCard room={room} />
                </div>
              ))}
            </div>

            {filteredRooms.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">Tidak ada ruangan tersedia</p>
              </div>
            )}
          </>
        )}
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">FAQ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link 
              to="/booking-guide"
              className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer"
            >
              <img 
                src="/src/assets/Cara booking.png" 
                alt="Cara Booking" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <h3 className="text-white font-bold text-lg">Cara Booking</h3>
              </div>
            </Link>
            <Link 
              to="/promo"
              className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer"
            >
              <img 
                src="/src/assets/Promo dan diskon.png" 
                alt="Promo & Diskon" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <h3 className="text-white font-bold text-lg">Promo & Diskon</h3>
              </div>
            </Link>
            <Link 
              to="/location"
              className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer"
            >
              <img 
                src="/src/assets/Lokasi.png" 
                alt="Lokasi & Kontak" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <h3 className="text-white font-bold text-lg">Lokasi & Kontak</h3>
              </div>
            </Link>
          </div>
        </section>
      </div>
      
      <Footer />
      
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
