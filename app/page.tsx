"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

// Game state interface
interface GameState {
  connected: boolean
  playerAddress: string | null
  playerData: PlayerData | null
  spinning: boolean
}

interface PlayerData {
  address: string
  username: string
  level: number
  xp: number
  total_tokens_won: number
  daily_streak: number
  referral_code: string
  can_spin_today: boolean
}

interface SpinResult {
  success: boolean
  reward: number
  xp_gained: number
  new_level: number
  streak: number
  multipliers: {
    level: number
    streak: number
    total: number
  }
}

// Wheel segments configuration
const wheelSegments = [
  { label: "1,000", value: 1000, color: "#ff6b6b" },
  { label: "2,500", value: 2500, color: "#4ecdc4" },
  { label: "5,000", value: 5000, color: "#45b7d1" },
  { label: "10,000", value: 10000, color: "#96ceb4" },
  { label: "25,000", value: 25000, color: "#feca57" },
  { label: "50,000", value: 50000, color: "#ff9ff3" },
  { label: "100,000", value: 100000, color: "#54a0ff" },
  { label: "MEGA!", value: 250000, color: "#5f27cd" },
]

export default function CreatorCoinSpinGame() {
  const [gameState, setGameState] = useState<GameState>({
    connected: false,
    playerAddress: null,
    playerData: null,
    spinning: false,
  })

  const [showResult, setShowResult] = useState(false)
  const [lastSpinResult, setLastSpinResult] = useState<SpinResult | null>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Mock wallet connection
  const connectWallet = async () => {
    try {
      // Simulate wallet connection
      const mockAddress = "0x" + Math.random().toString(16).substr(2, 40)

      setGameState((prev) => ({
        ...prev,
        connected: true,
        playerAddress: mockAddress,
      }))

      // Load mock player data
      await loadPlayerData(mockAddress)
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }

  const loadPlayerData = async (address: string) => {
    // Mock player data
    const mockPlayerData: PlayerData = {
      address: address,
      username: `Player${Math.floor(Math.random() * 9999)}`,
      level: Math.floor(Math.random() * 10) + 1,
      xp: Math.floor(Math.random() * 5000),
      total_tokens_won: Math.floor(Math.random() * 100000),
      daily_streak: Math.floor(Math.random() * 7),
      referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      can_spin_today: true,
    }

    setGameState((prev) => ({
      ...prev,
      playerData: mockPlayerData,
    }))

    loadMockLeaderboard()
  }

  const loadMockLeaderboard = () => {
    const mockLeaderboard = Array.from({ length: 10 }, (_, i) => ({
      rank: i + 1,
      username: `Player${Math.floor(Math.random() * 9999)}`,
      address: "0x" + Math.random().toString(16).substr(2, 6) + "...",
      level: Math.floor(Math.random() * 20) + 1,
      total_tokens: Math.floor(Math.random() * 500000),
      streak: Math.floor(Math.random() * 10),
    }))

    setLeaderboard(mockLeaderboard)
  }

  const spinWheel = async () => {
    if (gameState.spinning || !gameState.connected || !gameState.playerData?.can_spin_today) {
      return
    }

    setGameState((prev) => ({ ...prev, spinning: true }))

    // Animate wheel
    animateWheel()

    // Simulate API call
    setTimeout(() => {
      const reward = wheelSegments[Math.floor(Math.random() * wheelSegments.length)].value
      const xpGained = Math.floor(reward / 100)
      const levelMultiplier = 1 + gameState.playerData!.level * 0.05
      const streakMultiplier = 1 + gameState.playerData!.daily_streak * 0.1

      const result: SpinResult = {
        success: true,
        reward: Math.floor(reward * levelMultiplier * streakMultiplier),
        xp_gained: xpGained,
        new_level: gameState.playerData!.level,
        streak: gameState.playerData!.daily_streak + 1,
        multipliers: {
          level: levelMultiplier,
          streak: streakMultiplier,
          total: levelMultiplier * streakMultiplier,
        },
      }

      setLastSpinResult(result)
      setShowResult(true)
      setGameState((prev) => ({ ...prev, spinning: false }))

      // Update player data
      if (gameState.playerData) {
        setGameState((prev) => ({
          ...prev,
          playerData: {
            ...prev.playerData!,
            total_tokens_won: prev.playerData!.total_tokens_won + result.reward,
            xp: prev.playerData!.xp + result.xp_gained,
            daily_streak: result.streak,
            can_spin_today: false,
          },
        }))
      }
    }, 3000)
  }

  const animateWheel = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let rotation = 0
    let speed = 0.3
    const deceleration = 0.99

    const animate = () => {
      rotation += speed
      speed *= deceleration

      drawWheel(ctx, rotation)

      if (speed > 0.01) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }

  const drawWheel = (ctx: CanvasRenderingContext2D, rotation = 0) => {
    const canvas = ctx.canvas
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(rotation)

    const segmentAngle = (2 * Math.PI) / wheelSegments.length

    wheelSegments.forEach((segment, index) => {
      const startAngle = index * segmentAngle
      const endAngle = startAngle + segmentAngle

      // Draw segment
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = segment.color
      ctx.fill()
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw text
      ctx.save()
      ctx.rotate(startAngle + segmentAngle / 2)
      ctx.textAlign = "center"
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px Arial"
      ctx.fillText(segment.label, radius * 0.7, 5)
      ctx.restore()
    })

    ctx.restore()

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI)
    ctx.fillStyle = "#333"
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 3
    ctx.stroke()
  }

  useEffect(() => {
    // Draw initial wheel
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        drawWheel(ctx)
      }
    }
  }, [])

  const copyReferralCode = () => {
    if (gameState.playerData?.referral_code) {
      navigator.clipboard.writeText(gameState.playerData.referral_code)
      alert("Referral code copied!")
    }
  }

  const shareToSocial = (platform: string) => {
    const text = `🚀 I'm playing Creator Coin Spin Game and earning tokens! Join me and use my referral code: ${gameState.playerData?.referral_code || "PLAY2024"}`
    const url = window.location.href

    if (platform === "telegram") {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank")
    } else if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        "_blank",
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
            🚀 Creator Coin Spin
          </h1>
          <p className="text-xl opacity-80">Spin the wheel and win Creator tokens!</p>
        </header>

        {/* Wallet Connection */}
        {!gameState.connected ? (
          <div className="text-center mb-8">
            <Button
              onClick={connectWallet}
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-3 px-8 rounded-full"
            >
              Connect Wallet
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Player Stats */}
            <div className="lg:col-span-1">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Player Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Level:</span>
                    <Badge variant="secondary">⭐ {gameState.playerData?.level}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Streak:</span>
                    <Badge variant="secondary">🔥 {gameState.playerData?.daily_streak}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Won:</span>
                    <Badge variant="secondary">💰 {gameState.playerData?.total_tokens_won.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>XP:</span>
                    <Badge variant="secondary">🎯 {gameState.playerData?.xp.toLocaleString()}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Referral Section */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 mt-4">
                <CardHeader>
                  <CardTitle className="text-white">👥 Referral Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      value={gameState.playerData?.referral_code || ""}
                      readOnly
                      className="bg-white/20 border-white/30 text-white"
                    />
                    <Button onClick={copyReferralCode} size="sm">
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Social Sharing */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 mt-4">
                <CardHeader>
                  <CardTitle className="text-white">📱 Share & Earn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button onClick={() => shareToSocial("telegram")} className="w-full bg-blue-600 hover:bg-blue-700">
                    📱 Share on Telegram (+100 CC)
                  </Button>
                  <Button onClick={() => shareToSocial("twitter")} className="w-full bg-sky-600 hover:bg-sky-700">
                    🐦 Share on Twitter (+100 CC)
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Spin Wheel */}
            <div className="lg:col-span-1 flex flex-col items-center">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 w-full max-w-md">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-6">
                    <canvas
                      ref={canvasRef}
                      width={300}
                      height={300}
                      className="rounded-full border-4 border-white/30"
                    />
                  </div>
                  <Button
                    onClick={spinWheel}
                    disabled={gameState.spinning || !gameState.playerData?.can_spin_today}
                    size="lg"
                    className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-full disabled:opacity-50"
                  >
                    {gameState.spinning ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        SPINNING...
                      </div>
                    ) : gameState.playerData?.can_spin_today ? (
                      "SPIN NOW - FREE!"
                    ) : (
                      "Come back tomorrow!"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Leaderboard */}
            <div className="lg:col-span-1">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">🏆 Leaderboard</CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {leaderboard.slice(0, 10).map((player, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded bg-white/5">
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-bold ${
                              player.rank === 1
                                ? "text-yellow-400"
                                : player.rank === 2
                                  ? "text-gray-300"
                                  : player.rank === 3
                                    ? "text-orange-400"
                                    : "text-white"
                            }`}
                          >
                            #{player.rank}
                          </span>
                          <div>
                            <div className="font-semibold">{player.username}</div>
                            <div className="text-xs opacity-60">{player.address}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{player.total_tokens.toLocaleString()} CC</div>
                          <div className="text-xs opacity-60">Lv.{player.level}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Result Modal */}
        {showResult && lastSpinResult && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 w-full max-w-md mx-4">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-3xl font-bold mb-4 text-yellow-400">Congratulations!</h3>
                <p className="text-xl mb-6">
                  You won <span className="font-bold text-green-400">{lastSpinResult.reward.toLocaleString()}</span>{" "}
                  Creator Coins!
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="bg-white/10 rounded p-3">
                    <div className="font-semibold">Tokens Won</div>
                    <div className="text-lg">{lastSpinResult.reward.toLocaleString()}</div>
                  </div>
                  <div className="bg-white/10 rounded p-3">
                    <div className="font-semibold">XP Gained</div>
                    <div className="text-lg">{lastSpinResult.xp_gained.toLocaleString()}</div>
                  </div>
                </div>
                {lastSpinResult.multipliers.total > 1 && (
                  <p className="text-sm mb-4 text-yellow-300">
                    Bonus Multiplier: {lastSpinResult.multipliers.total.toFixed(2)}x
                  </p>
                )}
                <Button
                  onClick={() => setShowResult(false)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Continue Playing
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
