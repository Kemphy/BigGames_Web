import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Logo from "./Logo"

export default function Navbar() {
  const location = useLocation()
  const { user } = useAuth()

  const navItems = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/profile", label: "Profile", icon: "👤", requireAuth: true },
  ]

  if (user?.role === "ADMIN") {
    navItems.push({ path: "/admin", label: "Admin", icon: "⚙️" })
  }

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <Logo className="w-10 h-10" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">
              BIG GAMES
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              if (item.requireAuth && !user) return null
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
            
            {!user && (
              <Link to="/login" className="btn-primary py-2">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
