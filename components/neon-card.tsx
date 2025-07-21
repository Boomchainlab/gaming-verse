import type { ReactNode } from "react"

interface NeonCardProps {
  children: ReactNode
  className?: string
  glowColor?: "purple" | "green" | "blue" | "yellow"
}

export function NeonCard({ children, className = "", glowColor = "purple" }: NeonCardProps) {
  const glowClasses = {
    purple: "glow-purple border-purple-500",
    green: "glow-green border-green-500",
    blue: "glow-blue border-blue-500",
    yellow: "glow-yellow border-yellow-500",
  }

  return <div className={`bg-gray-800 border-2 rounded-xl p-6 ${glowClasses[glowColor]} ${className}`}>{children}</div>
}
