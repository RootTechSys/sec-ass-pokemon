import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "weekly"

    let dateFilter = ""
    switch (timeframe) {
      case "daily":
        dateFilter = "AND DATE(bh.created_at) = CURDATE()"
        break
      case "weekly":
        dateFilter = "AND bh.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
        break
      case "monthly":
        dateFilter = "AND bh.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
        break
      default:
        dateFilter = ""
    }

    const leaderboard = await query(
      `
      SELECT u.id as user_id, u.username, u.avatar, u.level,
             COUNT(bh.id) as score,
             ROW_NUMBER() OVER (ORDER BY COUNT(bh.id) DESC) as rank,
             g.name as guild_name,
             ut.title,
             0 as change
      FROM users u
      LEFT JOIN battle_history bh ON u.id = bh.winner_id ${dateFilter}
      LEFT JOIN guild_members gm ON u.id = gm.user_id
      LEFT JOIN guilds g ON gm.guild_id = g.id
      LEFT JOIN user_titles ut ON u.id = ut.user_id AND ut.active = 1
      GROUP BY u.id
      HAVING score > 0
      ORDER BY score DESC
      LIMIT 50
    `,
    )

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch battle leaderboard" }, { status: 500 })
  }
}
