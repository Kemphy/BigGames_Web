import { useState, useEffect } from "react"
import ConsoleCard from "../components/ConsoleCard"
import { roomService } from "../services/room.service"
import type { Room } from "../types/api"

type Category = "ALL" | "VIP" | "REGULER" | "SIMULATOR"

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<Category>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadRooms()
  }, [category])

  const loadRooms = async () => {
    setLoading(true)
    try {
      const response = await roomService.getRooms({
        category: category === "ALL" ? undefined : category,
        pageSize: 50
      })
      setRooms(response.rooms)
    } catch (error) {
      console.error("Failed to load rooms:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categories: Category[] = ["ALL", "VIP", "REGULER", "SIMULATOR"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold">
          Pilih <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Ruangan</span>
        </h1>
        <p className="text-white/60">
          Nikmati pengalaman gaming terbaik di BIG GAMES
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto">
        <input
          type="text"
          placeholder="Cari ruangan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10"
        />
        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Category Filter */}
      <div className="flex gap-3 justify-center flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              category === cat
                ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            {cat === "ALL" ? "Semua" : cat}
          </button>
        ))}
      </div>

      {/* Console Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-400">Loading rooms...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRooms.map((room) => (
              <ConsoleCard key={room.id} room={room} />
            ))}
          </div>

          {filteredRooms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/40">Tidak ada ruangan tersedia</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
