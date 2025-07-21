"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface TelegramGameState {
  connected: boolean
  playerAddress: string | null
  playerData: any
  spinning: false
  telegramUser: any
}

export default function TelegramGame() {
  const [gameState, setGameState] = useState<TelegramGameState>({
    connected: false,
    playerAddress: null,
    playerData: null,
    spinning: false,
    telegramUser: null,
  })

  const [showResult, setShowResult] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Initialize Telegram Web App
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp
      tg.ready()
      tg.expand()

      const user = tg.initDataUnsafe?.user
      if (user) {
        setGameState((prev) => ({
          ...prev,
          telegramUser: user,
        }))
      }
    }

    // Draw initial wheel
    drawWheel()
  }, [])

  const connectWallet = async () => {
    const mockAddress = "0x" + Math.random().toString(16).substr(2, 40)

    setGameState((prev) => ({
      ...prev,
      connected: true,
      playerAddress: mockAddress,
      playerData: {
        level: Math.floor(Math.random() * 10) + 1,
        daily_streak: Math.floor(Math.random() * 7),
        total_tokens_won: Math.floor(Math.random() * 50000),
        can_spin_today: true,
      },
    }))
  }

  const drawWheel = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10

    const segments = [
      { label: "1K", color: "#ff6b6b" },
      { label: "2.5K", color: "#4ecdc4" },
      { label: "5K", color: "#45b7d1" },
      { label: "10K", color: "#96ceb4" },
      { label: "25K", color: "#feca57" },
      { label: "50K", color: "#ff9ff3" },
      { label: "100K", color: "#54a0ff" },
      { label: "MEGA", color: "#5f27cd" },
    ]

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const segmentAngle = (2 * Math.PI) / segments.length

    segments.forEach((segment, index) => {
      const startAngle = index * segmentAngle
      const endAngle = startAngle + segmentAngle

      // Draw segment
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = segment.color
      ctx.fill()
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw text
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + segmentAngle / 2)
      ctx.textAlign = "center"
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px Arial"
      ctx.fillText(segment.label, radius * 0.7, 5)
      ctx.restore()
    })

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI)
    ctx.fillStyle = "#333"
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.stroke()
  }

  const spin = async () => {
    if (!gameState.connected) return

    setGameState((prev) => ({ ...prev, spinning: true }))

    // Simulate spinning animation
    setTimeout(() => {
      const reward = Math.floor(Math.random() * 100000) + 1000
      setLastResult({
        reward,
        xp_gained: Math.floor(reward / 100),
        streak: gameState.playerData.daily_streak + 1,
      })
      setShowResult(true)
      setGameState((prev) => ({ ...prev, spinning: false }))
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">🚀 Creator Coin Spin</h1>
          <p className="opacity-80">Hello, {gameState.telegramUser?.first_name || "Player"}!</p>
        </header>

        {/* Quick Stats */}
        {gameState.connected && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-2xl">⭐</div>
              <div className="font-bold">{gameState.playerData?.level || 1}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-2xl">🔥</div>
              <div className="font-bold">{gameState.playerData?.daily_streak || 0}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-2xl">💰</div>
              <div className="font-bold text-xs">{gameState.playerData?.total_tokens_won?.toLocaleString() || 0}</div>
            </div>
          </div>
        )}

        {/* Wheel */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <canvas ref={canvasRef} width={250} height={250} className="rounded-full border-2 border-white/30" />
          </div>
        </div>

        {/* Connect or Spin Button */}
        <div className="text-center mb-6">
          {!gameState.connected ? (
            <div className="space-y-4">
              <Button
                onClick={connectWallet}
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                🔗 Connect Wallet to Play
              </Button>
              <p className="text-sm opacity-70">Connect your wallet to start earning Creator Coins!</p>
            </div>
          ) : (
            <Button
              onClick={spin}
              disabled={gameState.spinning || !gameState.playerData?.can_spin_today}
              size="lg"
              className="w-full bg-gradient-to-r from-yellow-400 to-red-500 hover:from-yellow-500 hover:to-red-600 disabled:opacity-50"
            >
              {gameState.spinning ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  SPINNING...
                </div>
              ) : gameState.playerData?.can_spin_today ? (
                <div>
                  <div className="font-bold text-lg">SPIN</div>
                  <div className="text-xs">Daily Free Spin</div>
                </div>
              ) : (
                "Come back tomorrow!"
              )}
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        {gameState.connected && (
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="text-xs py-2 bg-transparent">
              🏆 Leaderboard
            </Button>
            <Button variant="outline" className="text-xs py-2 bg-transparent">
              🎯 Achievements
            </Button>
            <Button variant="outline" className="text-xs py-2 bg-transparent">
              📱 Share Game
            </Button>
          </div>
        )}

        {/* Result Modal */}
        {showResult && lastResult && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 w-full max-w-sm">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-xl font-bold mb-3">Congratulations!</h3>
                <div className="bg-white/20 rounded-lg p-4 mb-4">
                  <div className="text-2xl font-bold text-yellow-400">{lastResult.reward.toLocaleString()}</div>
                  <div className="text-sm opacity-80">Creator Coins</div>
                </div>
                <div className="text-sm mb-4">
                  +{lastResult.xp_gained} XP | Streak: {lastResult.streak} days
                </div>
                <Button onClick={() => setShowResult(false)} className="w-full">
                  Continue
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
