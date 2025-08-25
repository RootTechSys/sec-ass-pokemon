import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM user_cards WHERE user_id = ${userId}) as totalCards,
        (SELECT COUNT(DISTINCT card_id) FROM user_cards WHERE user_id = ${userId}) as uniqueCards,
        (SELECT COUNT(*) FROM battles WHERE winner_id = ${userId}) as battlesWon,
        (SELECT COUNT(*) FROM trades WHERE (requester_id = ${userId} OR target_id = ${userId}) AND status = 'accepted') as tradesCompleted,
        (SELECT COUNT(*) FROM pack_purchases WHERE user_id = ${userId}) as packsOpened,
        (SELECT COUNT(DISTINCT uc.card_id) FROM user_cards uc JOIN pokemon_cards pc ON uc.card_id = pc.id WHERE uc.user_id = ${userId} AND pc.rarity IN ('Legendary', 'Mythic')) as legendaryCards
    `

    const stats = await executeQuery(statsQuery)
    return NextResponse.json(
      stats[0] || {
        totalCards: 0,
        uniqueCards: 0,
        battlesWon: 0,
        tradesCompleted: 0,
        packsOpened: 0,
        legendaryCards: 0,
      },
    )
  } catch (error) {
    console.error("User stats error:", error)
    return NextResponse.json({
      totalCards: 0,
      uniqueCards: 0,
      battlesWon: 0,
      tradesCompleted: 0,
      packsOpened: 0,
      legendaryCards: 0,
    })
  }
}
