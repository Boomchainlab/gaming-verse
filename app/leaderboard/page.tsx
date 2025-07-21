"use client"

import { useState } from "react"
import Link from "next/link"
import { Trophy, ArrowLeft, Medal, Crown } from "lucide-react"
import { NeonCard } from "@/components/neon-card"
import { GlowButton } from "@/components/glow-button"
import { WalletAddress } from "@/components/wallet-address"

const leaderboardData = [
  { rank: 1, wallet: "0x1234567890abcdef1234567890abcdef12345678", spins: 247, earned: "15,420" },
  { rank: 2, wallet: "0xabcdef1234567890abcdef1234567890abcdef12", spins: 198, earned: "12,890" },
  { rank: 3, wallet: "0x9876543210fedcba9876543210fedcba98765432", spins: 156, earned: "9,750" },
  { rank: 4, wallet: "0xfedcba9876543210fedcba9876543210fedcba98", spins: 134, earned: "8,200" },
  { rank: 5, wallet: "0x5678901234abcdef5678901234abcdef56789012", spins: 112, earned: "6,890" },
]

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("today")

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />
      default:
        return <span className="text-gray-400">#{rank}</span>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-8">
          <h1 className="text-3xl font-bold text-glow text-blue-400 mb-2">Top Spinners Today</h1>
          <p className="text-gray-300">The most active and lucky users earn the most $CHONK9K!</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center">
          <div className="bg-gray-800 rounded-lg p-1 flex">
            {["today", "week", "all"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === tab ? "bg-blue-600 text-white glow-blue" : "text-gray-400 hover:text-white"
                }`}
              >
                {tab === "today" ? "Today" : tab === "week" ? "This Week" : "All Time"}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <NeonCard glowColor="blue">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Leaderboard
            </h3>

            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-400 border-b border-gray-600 pb-2">
              <div>Rank</div>
              <div>Wallet</div>
              <div>Spins</div>
              <div>$CHONK9K</div>
            </div>

            {/* Table Rows */}
            <div className="space-y-3">
              {leaderboardData.map((player) => (
                <div
                  key={player.rank}
                  className={`grid grid-cols-4 gap-4 items-center p-3 rounded-lg transition-all hover:bg-gray-700 ${
                    player.rank <= 3 ? "bg-gray-750 border border-yellow-500/20" : "bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2">{getRankIcon(player.rank)}</div>
                  <div>
                    <WalletAddress address={player.wallet} className="text-blue-400" />
                  </div>
                  <div className="text-gray-300">{player.spins}</div>
                  <div className="text-yellow-400 font-bold">{player.earned}</div>
                </div>
              ))}
            </div>
          </div>
        </NeonCard>

        {/* Back Button */}
        <div className="sticky bottom-4">
          <Link href="/">
            <GlowButton glowColor="purple" size="lg" className="w-full">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Spin Game
            </GlowButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
