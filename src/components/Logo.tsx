import logoCircle from '../assets/Logo.png'
import logoHorizontal from '../assets/LogoPanjang.png'

export default function Logo({ className = "w-10 h-10", variant = "circle" }: { className?: string; variant?: "circle" | "horizontal" }) {
  if (variant === "horizontal") {
    return (
      <img 
        src={logoHorizontal} 
        alt="BigGames Logo" 
        className={className}
      />
    )
  }
  
  return (
    <img 
      src={logoCircle} 
      alt="BigGames Logo" 
      className={className}
    />
  )
}
