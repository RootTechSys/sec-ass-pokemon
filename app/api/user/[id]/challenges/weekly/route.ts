import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)

    const challenges = await query(
      `
      SELECT wc.*, 
             COALESCE(uwc.current_progress, 0) as current_progress,
             COALESCE(uwc.completed, 0) as completed,
             COALESCE(uwc.claimed, 0) as claimed
      FROM weekly_challenges wc
      LEFT JOIN user_weekly_challenges uwc ON wc.id = uwc.challenge_id AND uwc.user_id = ?
      WHERE wc.active = 1 AND wc.expires_at > NOW()
      ORDER BY wc.created_at ASC
    `,
      [userId],
    )

    return NextResponse.json({ challenges })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch weekly challenges" }, { status: 500 })
  }
}
