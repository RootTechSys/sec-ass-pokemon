import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)

    const challenges = await query(
      `
      SELECT dc.*, 
             COALESCE(udc.current_progress, 0) as current_progress,
             COALESCE(udc.completed, 0) as completed,
             COALESCE(udc.claimed, 0) as claimed
      FROM daily_challenges dc
      LEFT JOIN user_daily_challenges udc ON dc.id = udc.challenge_id AND udc.user_id = ?
      WHERE dc.active = 1 AND dc.expires_at > NOW()
      ORDER BY dc.created_at ASC
    `,
      [userId],
    )

    return NextResponse.json({ challenges })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch daily challenges" }, { status: 500 })
  }
}
