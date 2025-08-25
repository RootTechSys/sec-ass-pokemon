import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { userId, achievementId } = await request.json()

    const achievementTemplates = [
      { id: 1, reward: 25 },
      { id: 2, reward: 50 },
      { id: 3, reward: 100 },
      { id: 4, reward: 200 },
      { id: 5, reward: 30 },
      { id: 6, reward: 75 },
      { id: 7, reward: 150 },
      { id: 8, reward: 300 },
      { id: 9, reward: 40 },
      { id: 10, reward: 80 },
      { id: 11, reward: 60 },
      { id: 12, reward: 120 },
      { id: 13, reward: 100 },
      { id: 14, reward: 180 },
      { id: 15, reward: 500 },
    ]

    const achievement = achievementTemplates.find((a) => a.id === achievementId)
    if (!achievement) {
      return NextResponse.json({ error: "Conquista não encontrada" }, { status: 404 })
    }

    await executeQuery(`
      INSERT INTO user_achievements (user_id, achievement_id, completed, claimed_at) 
      VALUES (${userId}, ${achievementId}, 1, NOW())
      ON DUPLICATE KEY UPDATE completed = 1, claimed_at = NOW()
    `)

    await executeQuery(`UPDATE users SET coins = coins + ${achievement.reward} WHERE id = ${userId}`)

    return NextResponse.json({ success: true, reward: achievement.reward })
  } catch (error) {
    console.error("Claim achievement error:", error)
    return NextResponse.json({ error: "Erro ao reivindicar conquista" }, { status: 500 })
  }
}
