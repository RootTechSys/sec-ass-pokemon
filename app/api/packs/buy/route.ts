import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret") as any
    const userId = decoded.userId

    const userQuery = `SELECT coins FROM users WHERE id = ${userId}`
    const users = (await executeQuery(userQuery)) as any[]

    if (users.length === 0 || users[0].coins < 50) {
      return NextResponse.json({ error: "Moedas insuficientes" }, { status: 400 })
    }

    const cardsQuery = "SELECT * FROM pokemon_cards ORDER BY RAND() LIMIT 3"
    const randomCards = (await executeQuery(cardsQuery)) as any[]

    await executeQuery(`UPDATE users SET coins = coins - 50 WHERE id = ${userId}`)

    for (const card of randomCards) {
      const existingCard = (await executeQuery(
        `SELECT * FROM user_cards WHERE user_id = ${userId} AND card_id = ${card.id}`,
      )) as any[]

      if (existingCard.length > 0) {
        await executeQuery(
          `UPDATE user_cards SET quantity = quantity + 1 WHERE user_id = ${userId} AND card_id = ${card.id}`,
        )
      } else {
        await executeQuery(`INSERT INTO user_cards (user_id, card_id, quantity) VALUES (${userId}, ${card.id}, 1)`)
      }
    }

    await executeQuery(
      `INSERT INTO pack_purchases (user_id, pack_type, cost, cards_received) VALUES (${userId}, 'basic', 50, '${JSON.stringify(randomCards.map((c) => c.id))}')`,
    )

    return NextResponse.json({
      cards: randomCards,
      newBalance: users[0].coins - 50,
    })
  } catch (error) {
    console.error("Pack purchase error:", error)
    return NextResponse.json({ error: "Erro ao comprar pacote" }, { status: 500 })
  }
}
