import { Link } from "react-router-dom"
import type { Room } from "../types/api"
import vipRoom1 from '../assets/VIPRoom1.jpg'
import vipRoom2 from '../assets/VIPRoom2.jpg'
import vipRoom3 from '../assets/VIPRoom3.jpg'
import simulatorRoom from '../assets/SimulatorRoom.jpg'
import regularRoom1 from '../assets/RegulerRoom1.jpg'
import regularRoom2 from '../assets/RegulerRoom2.jpg'

type Props = {
  room: Room
}

export default function ConsoleCard({ room }: Props) {
  const consoleType = room.units?.[0]?.console_type || "PS5_PRO"
  
  // Category-specific default images from assets folder
  const getDefaultImage = (category: string, roomName: string) => {
    const name = roomName.toLowerCase()
    
    if (category === "VIP") {
      if (name.includes("vip 1") || name.includes("vip room 1")) return vipRoom1
      if (name.includes("vip 2") || name.includes("vip room 2")) return vipRoom2
      if (name.includes("vip 3") || name.includes("vip room 3")) return vipRoom3
      return vipRoom1 // Default VIP image
    }
    
    if (category === "SIMULATOR") {
      return simulatorRoom
    }
    
    // REGULAR category
    if (name.includes("regular 1") || name.includes("regular room 1")) return regularRoom1
    if (name.includes("regular 2") || name.includes("regular room 2")) return regularRoom2
    return regularRoom1 // Default regular image
  }
  
  const imageUrl = room.images?.[0] || getDefaultImage(room.category, room.name)

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(parseFloat(price))
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "VIP":
        return "bg-yellow-500"
      case "SIMULATOR":
        return "bg-cyan-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <Link to={`/booking/${room.id}`}>
      <div className="group cursor-pointer glass-card overflow-hidden hover:border-blue-500 transition-all duration-200">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={room.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          
          {/* Category Badge */}
          <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getCategoryBadgeColor(room.category)}`}>
            {room.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-white mb-2">
            {room.name}
          </h3>
          
          <p className="text-sm text-slate-400 mb-3 line-clamp-2">
            {room.description}
          </p>

          <div className="flex items-center justify-between text-sm text-slate-300 mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{room.capacity} orang</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{consoleType.replace("_", " ")}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Mulai dari</p>
              <p className="text-xl font-bold text-white">
                {formatPrice(String(room.base_price_per_hour))}
                <span className="text-sm text-slate-400 font-normal">/jam</span>
              </p>
            </div>
            
            <button aria-label="Lihat detail" className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center group-hover:bg-blue-500 transition-all">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
