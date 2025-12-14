import { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" />
  if (user.role !== "ADMIN" && user.role !== "FINANCE") return <Navigate to="/" />

  return <>{children}</>
}
