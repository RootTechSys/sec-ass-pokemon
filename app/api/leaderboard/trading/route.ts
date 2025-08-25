import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "weekly"

    let dateFilter = ""
    switch (timeframe) {
      case "daily":
        dateFilter = "AND DATE(t.created_at) = CURDATE()"
        break
      case "weekly":
        dateFilter = "AND t.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
        break
      case "monthly":
        dateFilter = "AND t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
        break
      default:
        dateFilter = ""
    }

    const leaderboard = await query(
      `
      SELECT u.id as user_id, u.username, u.avatar, u.level,
             COUNT(t.id) as score,
             ROW_NUMBER() OVER (ORDER BY COUNT(t.id) DESC) as rank,
             g.name as guild_name,
             ut.title,
             0 as change
      FROM users u
      LEFT JOIN trades t ON (u.id = t.requester_id OR u.id = t.receiver_id) 
                         AND t.status = 'completed' ${dateFilter}
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
    return NextResponse.json({ error: "Failed to fetch trading leaderboard" }, { status: 500 })
  }
}
