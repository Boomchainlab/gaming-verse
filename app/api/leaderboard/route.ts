import { NextResponse } from "next/server"

export async function GET() {
  // Mock leaderboard data
  const leaderboard = Array.from({ length: 50 }, (_, i) => ({
    rank: i + 1,
    username: `Player${Math.floor(Math.random() * 9999)}`,
    address: `0x${Math.random().toString(16).substr(2, 6)}...${Math.random().toString(16).substr(2, 4)}`,
    level: Math.floor(Math.random() * 50) + 1,
    total_tokens: Math.floor(Math.random() * 1000000),
    streak: Math.floor(Math.random() * 20),
    avatar_id: Math.floor(Math.random() * 5) + 1,
  })).sort((a, b) => b.total_tokens - a.total_tokens)

  return NextResponse.json(leaderboard)
}
