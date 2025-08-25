import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const userId = searchParams.get("userId")

    if (search) {
      const query = `SELECT * FROM pokemon_cards WHERE name LIKE '%${search}%'`
      const cards = await executeQuery(query)
      return NextResponse.json(cards)
    }

    if (userId) {
      const query = `
        SELECT pc.*, uc.quantity 
        FROM pokemon_cards pc 
        JOIN user_cards uc ON pc.id = uc.card_id 
        WHERE uc.user_id = ${userId}
      `
      const userCards = await executeQuery(query)
      return NextResponse.json(userCards)
    }

    const allCards = await executeQuery("SELECT * FROM pokemon_cards ORDER BY name")
    return NextResponse.json(allCards)
  } catch (error) {
    console.error("Cards API error:", error)
    return NextResponse.json({ error: "Erro ao buscar cartas" }, { status: 500 })
  }
}
