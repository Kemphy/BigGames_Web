import { useState } from "react"
import ConsoleCard from "../components/ConsoleCard"
import { consoles } from "../services/consoles"

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "VIP" | "REGULER">("ALL")

  const filteredConsoles = selectedCategory === "ALL" 
    ? consoles 
    : consoles.filter(c => c.category === selectedCategory)

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

      {/* Category Filter */}
      <div className="flex gap-3 justify-center flex-wrap">
        {["ALL", "VIP", "REGULER"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat as any)}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              selectedCategory === cat
                ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            {cat === "ALL" ? "Semua" : cat}
          </button>
        ))}
      </div>

      {/* Console Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredConsoles.map((c) => (
          <ConsoleCard key={c.id} consoleData={c} />
        ))}
      </div>

      {filteredConsoles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/40">Tidak ada ruangan tersedia</p>
        </div>
      )}
    </div>
  )
}
