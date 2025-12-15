import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { foodService } from "../services/food.service"
import type { FoodOrder, MenuItem } from "../types/food"

export default function FoodSuccess() {
  const navigate = useNavigate()
  const location = useLocation()
  const order = location.state?.order as FoodOrder
  
  const [recommendations, setRecommendations] = useState<MenuItem[]>([])

  useEffect(() => {
    if (!order) {
      navigate("/food")
      return
    }
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    try {
      const items = await foodService.getMenuItems()
      setRecommendations(items.slice(0, 3))
    } catch (error) {
      console.error("Failed to load recommendations:", error)
    }
  }

  if (!order) return null

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-3xl p-8 text-center mb-8">
          {/* Illustration */}
          <div className="mb-6">
            <div className="relative w-64 h-64 mx-auto">
              {/* Decorative circles */}
              <div className="absolute top-8 left-12 w-16 h-16 bg-pink-200 rounded-full opacity-50"></div>
              <div className="absolute top-16 right-16 w-12 h-12 bg-pink-300 rounded-full opacity-40"></div>
              <div className="absolute bottom-20 left-20 w-20 h-20 bg-yellow-200 rounded-full opacity-30"></div>
              
              {/* Character illustration - simplified version */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  {/* Ice cream cone */}
                  <div className="absolute -right-8 top-4">
                    <div className="w-8 h-12 bg-orange-300 rounded-t-full"></div>
                    <div className="w-8 h-3 bg-yellow-200"></div>
                    <div className="w-8 h-8 bg-orange-400" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
                  </div>
                  
                  {/* Person */}
                  <div className="flex flex-col items-center">
                    {/* Head */}
                    <div className="w-16 h-16 bg-amber-200 rounded-full mb-2"></div>
                    {/* Body */}
                    <div className="w-24 h-32 bg-yellow-400 rounded-3xl relative">
                      {/* Arm */}
                      <div className="absolute -right-2 top-4 w-6 h-20 bg-amber-200 rounded-full transform rotate-45"></div>
                    </div>
                    {/* Legs */}
                    <div className="flex gap-2 mt-1">
                      <div className="w-8 h-16 bg-red-500 rounded-full"></div>
                      <div className="w-8 h-16 bg-red-500 rounded-full"></div>
                    </div>
                    {/* Shoes */}
                    <div className="flex gap-2">
                      <div className="w-10 h-6 bg-slate-800 rounded-full"></div>
                      <div className="w-10 h-6 bg-slate-800 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Your order is confirmed!
          </h1>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            we'll deliver your order immediately,<br />
            make sure you order out in the doorstep
          </p>

          <button
            onClick={() => navigate("/")}
            className="bg-red-500 text-white px-12 py-4 rounded-2xl font-bold hover:bg-red-600 transition-colors text-lg"
          >
            Back Home
          </button>
        </div>

        {/* Recommendations */}
        <div className="bg-slate-800 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Anything else?</h2>
            <button 
              onClick={() => navigate("/food")}
              className="text-red-500 text-sm font-medium hover:text-red-400"
            >
              See all
            </button>
          </div>

          <div className="space-y-4">
            {recommendations.map((item) => (
              <div key={item.id} className="flex items-center gap-4 bg-slate-700 rounded-2xl p-4 hover:bg-slate-650 transition-colors">
                <img
                  src={item.image_url || "https://placehold.co/80?text=No+Image"}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-white font-bold mb-1">{item.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">
                      {parseFloat(item.price).toLocaleString()}
                    </span>
                    <span className="text-slate-500 text-sm line-through">
                      {(parseFloat(item.price) * 1.2).toLocaleString()}
                    </span>
                  </div>
                  {item.free_delivery && (
                    <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full inline-block mt-1">
                      Free delivery
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/food")}
                  aria-label="Add to order"
                  className="w-10 h-10 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
