import { ConsoleType } from "../types/booking"
import { useNavigate } from "react-router-dom"

type Props = {
  consoleData: ConsoleType
}

export default function ConsoleCard({ consoleData }: Props) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/booking/${consoleData.id}`)}
      className="group cursor-pointer glass-card overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={consoleData.image}
          alt={consoleData.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Category Badge */}
        <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/80 backdrop-blur-sm">
          {consoleData.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-2">
          {consoleData.name}
        </h3>
        
        <p className="text-sm text-white/60 mb-4 line-clamp-2">
          {consoleData.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40">Mulai dari</p>
            <p className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Rp {consoleData.pricePerHour.toLocaleString()}
              <span className="text-sm text-white/60 font-normal">/jam</span>
            </p>
          </div>
          
          <button aria-label="Lihat detail" className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
