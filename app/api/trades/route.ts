import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret") as any
    const userId = decoded.userId

    const query = `
      SELECT 
        t.*,
        u1.username as from_username,
        u2.username as to_username,
        pc1.name as offered_card_name,
        pc2.name as requested_card_name
      FROM trade_offers t
      JOIN users u1 ON t.from_user_id = u1.id
      JOIN users u2 ON t.to_user_id = u2.id
      JOIN pokemon_cards pc1 ON t.offered_card_id = pc1.id
      JOIN pokemon_cards pc2 ON t.requested_card_id = pc2.id
      WHERE t.from_user_id = ${userId} OR t.to_user_id = ${userId}
      ORDER BY t.created_at DESC
    `

    const trades = await executeQuery(query)
    return NextResponse.json(trades)
  } catch (error) {
    console.error("Trades API error:", error)
    return NextResponse.json({ error: "Erro ao buscar trocas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret") as any
    const fromUserId = decoded.userId

    const { toUserId, offeredCardId, requestedCardId, message } = await request.json()

    const query = `
      INSERT INTO trade_offers (from_user_id, to_user_id, offered_card_id, requested_card_id, message)
      VALUES (${fromUserId}, ${toUserId}, ${offeredCardId}, ${requestedCardId}, '${message}')
    `

    await executeQuery(query)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Trade creation error:", error)
    return NextResponse.json({ error: "Erro ao criar proposta de troca" }, { status: 500 })
  }
}
