import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    const query = `
      SELECT pc.*, uc.quantity 
      FROM pokemon_cards pc 
      JOIN user_cards uc ON pc.id = uc.card_id 
      WHERE uc.user_id = ${userId}
      ORDER BY pc.rarity DESC, pc.name ASC
    `
    const userCards = await executeQuery(query)
    return NextResponse.json(userCards)
  } catch (error) {
    console.error("User cards fetch error:", error)
    return NextResponse.json({ error: "Erro ao buscar cartas do usuário" }, { status: 500 })
  }
}
