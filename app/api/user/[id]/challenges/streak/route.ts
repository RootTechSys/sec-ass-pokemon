import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)

    const streak = await query(
      `
      SELECT current_streak, longest_streak, last_completion_date,
             GROUP_CONCAT(streak_level) as streak_rewards_claimed
      FROM user_challenge_streaks ucs
      LEFT JOIN user_streak_rewards usr ON ucs.user_id = usr.user_id
      WHERE ucs.user_id = ?
      GROUP BY ucs.user_id
    `,
      [userId],
    )

    if (streak.length === 0) {
      await query(`INSERT INTO user_challenge_streaks (user_id, current_streak, longest_streak) VALUES (?, 0, 0)`, [
        userId,
      ])

      return NextResponse.json({
        streak: {
          current_streak: 0,
          longest_streak: 0,
          last_completion_date: null,
          streak_rewards_claimed: [],
        },
      })
    }

    const streakData = streak[0]
    const claimedRewards = streakData.streak_rewards_claimed
      ? streakData.streak_rewards_claimed.split(",").map(Number)
      : []

    return NextResponse.json({
      streak: {
        ...streakData,
        streak_rewards_claimed: claimedRewards,
      },
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch challenge streak" }, { status: 500 })
  }
}
