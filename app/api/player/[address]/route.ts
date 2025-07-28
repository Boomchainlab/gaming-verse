import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  const { address } = params

  // Mock player data
  const playerData = {
    address: address.toLowerCase(),
    username: `Player${Math.floor(Math.random() * 9999)}`,
    avatar_id: Math.floor(Math.random() * 5) + 1,
    level: Math.floor(Math.random() * 20) + 1,
    xp: Math.floor(Math.random() * 50000),
    total_tokens_won: Math.floor(Math.random() * 500000),
    daily_streak: Math.floor(Math.random() * 30),
    referral_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
    social_shares: Math.floor(Math.random() * 20),
    achievements: ["First Spin", "Token Collector"],
    can_spin_today: Math.random() > 0.3, // 70% chance can spin
  }

  return NextResponse.json(playerData)
}
