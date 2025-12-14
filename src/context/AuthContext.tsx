import { createContext, useContext, useEffect, useState, ReactNode } from "react"

type Role = "USER" | "ADMIN"

type AuthState = {
  role: Role
  name: string
}

type AuthContextType = {
  user: AuthState | null
  login: (role: Role, name: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)
const STORAGE_KEY = "biggames_auth"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) setUser(JSON.parse(raw))
  }, [])

  function login(role: Role, name: string) {
    const data = { role, name }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setUser(data)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
