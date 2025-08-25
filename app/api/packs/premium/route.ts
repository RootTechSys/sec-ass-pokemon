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

    if (users.length === 0 || users[0].coins < 150) {
      return NextResponse.json({ error: "Moedas insuficientes" }, { status: 400 })
    }

    const rarityWeights = {
      Common: 40,
      Uncommon: 30,
      Rare: 20,
      Epic: 7,
      Legendary: 2.5,
      Mythic: 0.5,
    }

    const cards = []
    for (let i = 0; i < 5; i++) {
      const rand = Math.random() * 100
      let rarity = "Common"

      if (rand < 0.5) rarity = "Mythic"
      else if (rand < 3) rarity = "Legendary"
      else if (rand < 10) rarity = "Epic"
      else if (rand < 30) rarity = "Rare"
      else if (rand < 60) rarity = "Uncommon"

      const cardsQuery = `SELECT * FROM pokemon_cards WHERE rarity = '${rarity}' ORDER BY RAND() LIMIT 1`
      const randomCard = (await executeQuery(cardsQuery)) as any[]
      if (randomCard.length > 0) {
        cards.push(randomCard[0])
      }
    }

    await executeQuery(`UPDATE users SET coins = coins - 150 WHERE id = ${userId}`)

    for (const card of cards) {
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
      `INSERT INTO pack_purchases (user_id, pack_type, cost, cards_received) VALUES (${userId}, 'premium', 150, '${JSON.stringify(cards.map((c) => c.id))}')`,
    )

    return NextResponse.json({
      cards: cards,
      newBalance: users[0].coins - 150,
    })
  } catch (error) {
    console.error("Premium pack purchase error:", error)
    return NextResponse.json({ error: "Erro ao comprar pacote premium" }, { status: 500 })
  }
}
