import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    const query = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.coins,
        u.created_at,
        COUNT(uc.card_id) as total_cards
      FROM users u
      LEFT JOIN user_cards uc ON u.id = uc.user_id
      GROUP BY u.id, u.username, u.email, u.coins, u.created_at
      ORDER BY u.created_at DESC
    `

    const users = await executeQuery(query)
    return NextResponse.json(users)
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, coins } = await request.json()

    const query = `UPDATE users SET coins = ${coins} WHERE id = ${userId}`
    await executeQuery(query)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin update error:", error)
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 })
  }
}
