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
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo className="w-20 h-20" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              BIG GAMES
            </h1>
            <p className="text-slate-400 mt-2">Masuk ke akun Anda</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
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
              <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold">
                Daftar
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
