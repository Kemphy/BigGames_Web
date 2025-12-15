import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Logo from "./Logo"

export default function Navbar() {
  const location = useLocation()
  const { user } = useAuth()

  const navItems: Array<{ path: string; label: string; icon?: string; requireAuth?: boolean }> = [
    { path: "/", label: "Home" },
    { path: "/profile", label: "Profile", icon: "👤", requireAuth: true },
  ]

  if (user?.role === "ADMIN" || user?.role === "FINANCE") {
    navItems.push({ path: "/admin", label: "Admin", icon: "⚙️" })
  }

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - ONLY gradient here */}
          <Link to="/" className="flex items-center space-x-3 group">
            <Logo className="w-10 h-10" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">
              BIG GAMES
            </span>
          </Link>

          {/* Navigation - Solid colors */}
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
                      ? "bg-purple-600 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  {item.icon && <span className="mr-1">{item.icon}</span>}
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
