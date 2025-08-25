import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { userId, coins } = await request.json()

    const query = `UPDATE users SET coins = coins + ${coins} WHERE id = ${userId}`
    await executeQuery(query)

    return NextResponse.json({ success: true, coinsAdded: coins })
  } catch (error) {
    console.error("Battle reward error:", error)
    return NextResponse.json({ error: "Erro ao dar recompensa" }, { status: 500 })
  }
}
