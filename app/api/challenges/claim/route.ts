import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { challenge_id, user_id, type } = await request.json()

    const tableName = type === "daily" ? "user_daily_challenges" : "user_weekly_challenges"
    const challengeTable = type === "daily" ? "daily_challenges" : "weekly_challenges"

    const userChallenge = await query(
      `SELECT * FROM ${tableName} WHERE challenge_id = ? AND user_id = ? AND completed = 1 AND claimed = 0`,
      [challenge_id, user_id],
    )

    if (userChallenge.length === 0) {
      return NextResponse.json({ error: "Challenge not completed or already claimed" }, { status: 400 })
    }

    const challenge = await query(`SELECT * FROM ${challengeTable} WHERE id = ?`, [challenge_id])

    if (challenge.length === 0) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    await query("START TRANSACTION")

    try {
      await query(`UPDATE ${tableName} SET claimed = 1, claimed_at = NOW() WHERE challenge_id = ? AND user_id = ?`, [
        challenge_id,
        user_id,
      ])

      if (challenge[0].reward_type === "coins") {
        await query("UPDATE users SET coins = coins + ? WHERE id = ?", [challenge[0].reward_value, user_id])
      } else if (challenge[0].reward_type === "pack") {
        // Add pack to user inventory (implementation depends on pack system)
      } else if (challenge[0].reward_type === "card") {
        // Add specific card to user collection
      }

      if (type === "daily") {
        const today = new Date().toISOString().split("T")[0]
        const streak = await query("SELECT * FROM user_challenge_streaks WHERE user_id = ?", [user_id])

        if (streak.length === 0) {
          await query(
            "INSERT INTO user_challenge_streaks (user_id, current_streak, longest_streak, last_completion_date) VALUES (?, 1, 1, ?)",
            [user_id, today],
          )
        } else {
          const lastDate = new Date(streak[0].last_completion_date)
          const todayDate = new Date(today)
          const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          let newStreak = 1
          if (diffDays === 1) {
            newStreak = streak[0].current_streak + 1
          }

          const newLongest = Math.max(newStreak, streak[0].longest_streak)

          await query(
            "UPDATE user_challenge_streaks SET current_streak = ?, longest_streak = ?, last_completion_date = ? WHERE user_id = ?",
            [newStreak, newLongest, today, user_id],
          )
        }
      }

      await query("COMMIT")

      return NextResponse.json({ success: true })
    } catch (error) {
      await query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to claim reward" }, { status: 500 })
  }
}
