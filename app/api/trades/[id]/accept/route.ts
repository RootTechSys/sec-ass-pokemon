import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret") as any
    const userId = decoded.userId
    const tradeId = params.id

    const tradeQuery = `SELECT * FROM trade_offers WHERE id = ${tradeId} AND to_user_id = ${userId} AND status = 'pending'`
    const trades = (await executeQuery(tradeQuery)) as any[]

    if (trades.length === 0) {
      return NextResponse.json({ error: "Proposta de troca não encontrada" }, { status: 404 })
    }

    const trade = trades[0]

    await executeQuery(`UPDATE trade_offers SET status = 'accepted' WHERE id = ${tradeId}`)

    await executeQuery(`
      UPDATE user_cards SET quantity = quantity - 1 
      WHERE user_id = ${trade.from_user_id} AND card_id = ${trade.offered_card_id}
    `)
    await executeQuery(`
      UPDATE user_cards SET quantity = quantity - 1 
      WHERE user_id = ${trade.to_user_id} AND card_id = ${trade.requested_card_id}
    `)

    const fromUserHasCard = (await executeQuery(`
      SELECT * FROM user_cards WHERE user_id = ${trade.from_user_id} AND card_id = ${trade.requested_card_id}
    `)) as any[]

    if (fromUserHasCard.length > 0) {
      await executeQuery(`
        UPDATE user_cards SET quantity = quantity + 1 
        WHERE user_id = ${trade.from_user_id} AND card_id = ${trade.requested_card_id}
      `)
    } else {
      await executeQuery(`
        INSERT INTO user_cards (user_id, card_id, quantity) 
        VALUES (${trade.from_user_id}, ${trade.requested_card_id}, 1)
      `)
    }

    const toUserHasCard = (await executeQuery(`
      SELECT * FROM user_cards WHERE user_id = ${trade.to_user_id} AND card_id = ${trade.offered_card_id}
    `)) as any[]

    if (toUserHasCard.length > 0) {
      await executeQuery(`
        UPDATE user_cards SET quantity = quantity + 1 
        WHERE user_id = ${trade.to_user_id} AND card_id = ${trade.offered_card_id}
      `)
    } else {
      await executeQuery(`
        INSERT INTO user_cards (user_id, card_id, quantity) 
        VALUES (${trade.to_user_id}, ${trade.offered_card_id}, 1)
      `)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Trade accept error:", error)
    return NextResponse.json({ error: "Erro ao aceitar troca" }, { status: 500 })
  }
}
