"use client"

import type { ReactNode } from "react"

interface GlowButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  glowColor?: "purple" | "green" | "blue" | "yellow"
  disabled?: boolean
  size?: "sm" | "md" | "lg"
}

export function GlowButton({
  children,
  onClick,
  className = "",
  glowColor = "purple",
  disabled = false,
  size = "md",
}: GlowButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }

  const colorClasses = {
    purple: "bg-purple-600 hover:bg-purple-700 border-purple-500 hover:glow-purple",
    green: "bg-green-600 hover:bg-green-700 border-green-500 hover:glow-green",
    blue: "bg-blue-600 hover:bg-blue-700 border-blue-500 hover:glow-blue",
    yellow: "bg-yellow-600 hover:bg-yellow-700 border-yellow-500 hover:glow-yellow",
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]} ${colorClasses[glowColor]}
        border-2 rounded-lg font-bold text-white
        transition-all duration-300 transform hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${className}
      `}
    >
      {children}
    </button>
  )
}
