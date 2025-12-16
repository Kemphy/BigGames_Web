import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Logo from "../components/Logo"

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      await register(email, password, name)
      navigate("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              BIG GAMES
            </h1>
            <p className="text-slate-400 mt-2">Buat akun baru</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-slate-200">
                Nama Lengkap
              </label>
              <input
                id="name"
                type="text"
                className="input-field"
                placeholder="Masukkan nama lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-slate-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-slate-200">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="Buat password (min 6 karakter)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-slate-200">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="input-field"
                placeholder="Ketik ulang password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
            {loading ? "Loading..." : "Daftar"}
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-slate-400">
              Sudah punya akun?{" "}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                Masuk
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
