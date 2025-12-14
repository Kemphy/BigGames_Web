export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`${className} rounded-xl bg-gradient-to-br from-purple-600 via-purple-500 to-cyan-500 flex items-center justify-center font-black text-white shadow-lg relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
      <span className="relative text-xl">BG</span>
    </div>
  )
}
