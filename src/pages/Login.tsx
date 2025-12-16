import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Logo from "../components/Logo"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const user = await login(email, password)
      // Redirect admin/finance to admin dashboard
      if (user.role === "ADMIN" || user.role === "FINANCE") {
        navigate("/admin")
      } else {
        navigate("/")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Logo & Info */}
        <div className="space-y-6 text-center lg:text-left">
          <div className="flex justify-center lg:justify-start">
            <Logo className="w-32 h-32" variant="circle" />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              BIG GAMES
            </h1>
            <p className="text-xl text-slate-300 font-semibold">
              Rental PlayStation Premium
            </p>
            <p className="text-slate-400 leading-relaxed">
              Nikmati pengalaman gaming terbaik dengan berbagai pilihan room VIP, Regular, dan Simulator. Booking mudah, harga terjangkau, dan fasilitas lengkap untuk pengalaman gaming yang tak terlupakan.
            </p>
          </div>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🎮</span>
              </div>
              <div>
                <p className="text-white font-semibold">PlayStation 5 Terbaru</p>
                <p className="text-sm text-slate-400">Console gaming generasi terbaru</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏎️</span>
              </div>
              <div>
                <p className="text-white font-semibold">Simulator Room</p>
                <p className="text-sm text-slate-400">Racing & gaming simulator</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🛋️</span>
              </div>
              <div>
                <p className="text-white font-semibold">Ruangan Nyaman</p>
                <p className="text-sm text-slate-400">VIP & Regular room tersedia</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🍔</span>
              </div>
              <div>
                <p className="text-white font-semibold">Food & Beverage</p>
                <p className="text-sm text-slate-400">Menu lengkap tersedia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full">
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Masuk ke Akun Anda</h2>
              <p className="text-slate-400">Silakan login untuk melanjutkan</p>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-slate-200">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2 text-slate-200">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
              {loading ? "Loading..." : "Masuk"}
            </button>
            
            <p className="text-center text-xs text-gray-500 mt-4">
              Demo: admin@biggames.com / admin123 • demo@example.com / demo123
            </p>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-slate-400">
                Belum punya akun?{" "}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
                  Daftar
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
