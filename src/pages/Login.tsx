import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Logo from "../components/Logo"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"USER" | "ADMIN">("USER")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return
    login(role, name)
    navigate(role === "ADMIN" ? "/admin" : "/")
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
            <p className="text-white/60 mt-2">Masuk ke akun Anda</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-white/80">
                Nama
              </label>
              <input
                id="name"
                type="text"
                className="input-field"
                placeholder="Masukkan nama"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Role Select */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-2 text-white/80">
                Login sebagai
              </label>
              <select
                id="role"
                className="input-field"
                value={role}
                onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="w-full btn-primary">
            Masuk
          </button>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-white/60">
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
