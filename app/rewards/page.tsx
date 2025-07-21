"use client"

import { useState } from "react"
import Link from "next/link"
import { Coins, ArrowLeft, Zap, Clock, CheckCircle } from "lucide-react"
import { NeonCard } from "@/components/neon-card"
import { GlowButton } from "@/components/glow-button"
import { WalletAddress } from "@/components/wallet-address"

const recentClaims = [
  { wallet: "0x1234567890abcdef1234567890abcdef12345678", amount: "1,250", time: "2 mins ago" },
  { wallet: "0xabcdef1234567890abcdef1234567890abcdef12", amount: "890", time: "15 mins ago" },
  { wallet: "0x9876543210fedcba9876543210fedcba98765432", amount: "2,100", time: "1 hour ago" },
]

export default function RewardsPage() {
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [availableRewards] = useState("3,420")

  const handleClaim = () => {
    setIsClaiming(true)
    setTimeout(() => {
      setIsClaiming(false)
      setClaimed(true)
      setTimeout(() => setClaimed(false), 3000)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-yellow-900 to-gray-900 p-4">
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
          <h1 className="text-3xl font-bold text-glow text-yellow-400 mb-2">Your Rewards</h1>
        </div>

        {/* Available Rewards */}
        <NeonCard glowColor="yellow" className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-yellow-600 rounded-full flex items-center justify-center glow-yellow">
              <Coins className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-yellow-400 mb-2">Your Available $CHONK9K Rewards</h2>
            <div className="text-4xl font-bold text-white mb-2">{availableRewards}</div>
            <WalletAddress address="0x1234567890abcdef1234567890abcdef12345678" className="text-gray-400" />
          </div>

          <GlowButton
            onClick={handleClaim}
            disabled={isClaiming || claimed}
            glowColor="green"
            size="lg"
            className="w-full"
          >
            {isClaiming ? (
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 animate-pulse" />
                Claiming...
              </div>
            ) : claimed ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Claimed!
              </div>
            ) : (
              "Claim Now"
            )}
          </GlowButton>
        </NeonCard>

        {/* Success Animation Area */}
        {claimed && (
          <div className="text-center">
            <div className="animate-bounce text-6xl">🎉</div>
            <p className="text-green-400 font-bold">Tokens claimed successfully!</p>
          </div>
        )}

        {/* Recent Claims */}
        <NeonCard glowColor="blue">
          <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Claims
          </h3>
          <div className="space-y-3">
            {recentClaims.map((claim, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-700 rounded-lg p-3">
                <div>
                  <WalletAddress address={claim.wallet} className="text-blue-400" />
                  <p className="text-xs text-gray-400">{claim.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold">{claim.amount} $CHONK9K</p>
                </div>
              </div>
            ))}
          </div>
        </NeonCard>

        {/* Secondary CTA */}
        <div className="text-center pb-8">
          <Link href="/leaderboard">
            <GlowButton glowColor="purple" size="lg" className="w-full">
              View My Spins
            </GlowButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
