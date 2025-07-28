import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, spin_type } = body

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock spin results
    const baseRewards = [1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000]
    const baseReward = baseRewards[Math.floor(Math.random() * baseRewards.length)]

    const levelMultiplier = 1 + Math.random() * 0.5 // 1.0 - 1.5x
    const streakMultiplier = 1 + Math.random() * 0.3 // 1.0 - 1.3x

    const finalReward = Math.floor(baseReward * levelMultiplier * streakMultiplier)
    const xpGained = Math.floor(finalReward / 100)

    const result = {
      success: true,
      reward: finalReward,
      tx_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      xp_gained: xpGained,
      new_level: Math.floor(Math.random() * 20) + 1,
      streak: Math.floor(Math.random() * 10) + 1,
      multipliers: {
        level: levelMultiplier,
        streak: streakMultiplier,
        total: levelMultiplier * streakMultiplier,
      },
      new_achievements: Math.random() > 0.8 ? [{ name: "Lucky Spinner", icon: "🍀", reward: 1000 }] : [],
      next_spin_in: "24 hours",
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Spin failed" }, { status: 500 })
  }
}
