import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Logo from "../components/Logo"

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email) return
    login("USER", name)
    navigate("/")
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
            <p className="text-white/60 mt-2">Buat akun baru</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-white/80">
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
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-white/80">
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

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-white/80">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="Buat password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="w-full btn-primary">
            Daftar
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-white/60">
              Sudah punya akun?{" "}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                Masuk
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
