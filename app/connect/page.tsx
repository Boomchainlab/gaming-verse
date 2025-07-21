"use client"

import Link from "next/link"
import { Wallet, Shield, ArrowLeft } from "lucide-react"
import { NeonCard } from "@/components/neon-card"
import { GlowButton } from "@/components/glow-button"

const walletOptions = [
  {
    name: "MetaMask",
    icon: "🦊",
    color: "yellow" as const,
    description: "Connect using MetaMask browser extension",
  },
  {
    name: "WalletConnect",
    icon: "🔗",
    color: "blue" as const,
    description: "Scan with WalletConnect to connect",
  },
  {
    name: "Coinbase Wallet",
    icon: "🔵",
    color: "green" as const,
    description: "Connect with Coinbase Wallet",
  },
]

export default function ConnectPage() {
  const handleWalletConnect = (walletName: string) => {
    console.log(`Connecting to ${walletName}...`)
    // Wallet connection logic would go here
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Back Button */}
        <div className="pt-4">
          <Link href="/">
            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center pt-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center glow-green">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-glow text-green-400 mb-2">Connect Your Wallet</h1>
          <p className="text-gray-300">Log in to spin, track rewards, and rank on the leaderboard.</p>
        </div>

        {/* Wallet Options */}
        <NeonCard glowColor="green">
          <div className="space-y-4">
            {walletOptions.map((wallet) => (
              <GlowButton
                key={wallet.name}
                onClick={() => handleWalletConnect(wallet.name)}
                glowColor={wallet.color}
                className="w-full text-left flex items-center gap-4 p-4 h-auto"
              >
                <div className="text-2xl">{wallet.icon}</div>
                <div className="flex-1">
                  <div className="font-bold text-lg">{wallet.name}</div>
                  <div className="text-sm opacity-80">{wallet.description}</div>
                </div>
              </GlowButton>
            ))}
          </div>
        </NeonCard>

        {/* Security Note */}
        <NeonCard glowColor="blue" className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-medium">Secure & Private</span>
          </div>
          <p className="text-sm text-gray-300">No data stored. Wallet used only for gameplay rewards.</p>
        </NeonCard>
      </div>
    </div>
  )
}
