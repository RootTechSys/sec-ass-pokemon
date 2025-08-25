import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "weekly"

    const leaderboard = await query(
      `
      SELECT g.id as guild_id, g.name as guild_name, g.level,
             COUNT(gm.user_id) as member_count,
             SUM(gm.contribution_points) as total_score,
             AVG(gm.contribution_points) as average_score,
             ROW_NUMBER() OVER (ORDER BY SUM(gm.contribution_points) DESC) as rank,
             0 as change
      FROM guilds g
      INNER JOIN guild_members gm ON g.id = gm.guild_id
      GROUP BY g.id
      HAVING total_score > 0
      ORDER BY total_score DESC
      LIMIT 50
    `,
    )

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch guild leaderboard" }, { status: 500 })
  }
}
