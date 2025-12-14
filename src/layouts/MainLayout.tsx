import { ReactNode } from "react"
import Navbar from "../components/Navbar"

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px]">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              BIG GAMES
            </p>
            <p className="text-sm text-white/40">
              © 2025 BIG GAMES. Rental PlayStation Premium.
            </p>
            <p className="text-xs text-white/30">
              Prototype Website - Demo Purpose Only
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
