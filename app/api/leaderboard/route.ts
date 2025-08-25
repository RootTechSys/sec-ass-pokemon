import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    const query = `
      SELECT 
        u.id,
        u.username,
        u.avatar,
        COUNT(uc.card_id) as total_cards,
        COUNT(DISTINCT uc.card_id) as unique_cards,
        SUM(CASE WHEN pc.rarity = 'Legendary' THEN 1 ELSE 0 END) as legendary_count,
        SUM(CASE WHEN pc.rarity = 'Mythic' THEN 1 ELSE 0 END) as mythic_count
      FROM users u
      LEFT JOIN user_cards uc ON u.id = uc.user_id
      LEFT JOIN pokemon_cards pc ON uc.card_id = pc.id
      GROUP BY u.id, u.username, u.avatar
      ORDER BY unique_cards DESC, legendary_count DESC, mythic_count DESC
      LIMIT 10
    `

    const leaderboard = await executeQuery(query)
    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ error: "Erro ao buscar ranking" }, { status: 500 })
  }
}
