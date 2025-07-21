"use client"

import { useState } from "react"
import Link from "next/link"
import { Coins, Trophy, Zap } from "lucide-react"
import { NeonCard } from "@/components/neon-card"
import { GlowButton } from "@/components/glow-button"
import { WalletAddress } from "@/components/wallet-address"

const recentWinners = [
  { wallet: "0x1234567890abcdef1234567890abcdef12345678", reward: "1,250", time: "3m ago" },
  { wallet: "0xabcdef1234567890abcdef1234567890abcdef12", reward: "890", time: "7m ago" },
  { wallet: "0x9876543210fedcba9876543210fedcba98765432", reward: "2,100", time: "12m ago" },
]

export default function HomePage() {
  const [isSpinning, setIsSpinning] = useState(false)

  const handleSpin = () => {
    setIsSpinning(true)
    setTimeout(() => setIsSpinning(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-8">
          <h1 className="text-4xl font-bold text-glow text-purple-400 mb-2">Creator Coin Spin</h1>
          <p className="text-gray-300 text-lg">Spin the wheel. Win $CHONK9K. Top the leaderboard.</p>
        </div>

        {/* Spin Wheel */}
        <NeonCard className="text-center" glowColor="purple">
          <div className="relative">
            <div
              className={`w-48 h-48 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center ${isSpinning ? "spin-animation" : ""}`}
            >
              <div className="w-40 h-40 rounded-full bg-gray-800 flex items-center justify-center">
                <Coins className="w-16 h-16 text-yellow-400" />
              </div>
            </div>
            <Link href="/connect">
              <GlowButton onClick={handleSpin} disabled={isSpinning} glowColor="green" size="lg" className="w-full">
                {isSpinning ? (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5 animate-pulse" />
                    Spinning...
                  </div>
                ) : (
                  "Connect Wallet to Play"
                )}
              </GlowButton>
            </Link>
          </div>
        </NeonCard>

        {/* Recent Winners */}
        <NeonCard glowColor="green">
          <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Recent Winners
          </h3>
          <div className="space-y-3">
            {recentWinners.map((winner, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-700 rounded-lg p-3">
                <div>
                  <WalletAddress address={winner.wallet} className="text-blue-400" />
                  <p className="text-xs text-gray-400">{winner.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold">{winner.reward} $CHONK9K</p>
                </div>
              </div>
            ))}
          </div>
        </NeonCard>

        {/* Footer CTA */}
        <div className="text-center pb-8">
          <Link href="/leaderboard">
            <GlowButton glowColor="blue" size="lg" className="w-full">
              <Trophy className="w-5 h-5 mr-2" />
              See Leaderboard
            </GlowButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
