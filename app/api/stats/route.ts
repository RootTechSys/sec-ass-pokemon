import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    const totalUsers = (await executeQuery("SELECT COUNT(*) as count FROM users")) as any[]
    const totalCards = (await executeQuery("SELECT COUNT(*) as count FROM pokemon_cards")) as any[]
    const totalTrades = (await executeQuery("SELECT COUNT(*) as count FROM trade_offers")) as any[]
    const totalPacks = (await executeQuery("SELECT COUNT(*) as count FROM pack_purchases")) as any[]

    const rarityStats = (await executeQuery(`
      SELECT rarity, COUNT(*) as count 
      FROM pokemon_cards 
      GROUP BY rarity 
      ORDER BY count DESC
    `)) as any[]

    const generationStats = (await executeQuery(`
      SELECT generation, COUNT(*) as count 
      FROM pokemon_cards 
      GROUP BY generation 
      ORDER BY generation ASC
    `)) as any[]

    return NextResponse.json({
      totalUsers: totalUsers[0].count,
      totalCards: totalCards[0].count,
      totalTrades: totalTrades[0].count,
      totalPacks: totalPacks[0].count,
      rarityStats,
      generationStats,
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 })
  }
}
