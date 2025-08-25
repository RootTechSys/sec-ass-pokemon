import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    const currentSeason = await query(
      `
      SELECT * FROM seasons 
      WHERE start_date <= NOW() AND end_date >= NOW() 
      ORDER BY id DESC 
      LIMIT 1
    `,
    )

    if (currentSeason.length === 0) {
      return NextResponse.json({
        season: {
          current_season: 1,
          season_start: new Date().toISOString(),
          season_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          total_players: 0,
          your_rank: null,
          your_score: null,
        },
      })
    }

    const season = currentSeason[0]

    const totalPlayers = await query("SELECT COUNT(DISTINCT id) as count FROM users")

    let userStats = null
    if (userId) {
      const userRank = await query(
        `
        SELECT 
          (SELECT COUNT(*) + 1 FROM users u2 WHERE u2.level > u1.level) as rank,
          u1.level as score
        FROM users u1 
        WHERE u1.id = ?
      `,
        [userId],
      )

      if (userRank.length > 0) {
        userStats = {
          your_rank: userRank[0].rank,
          your_score: userRank[0].score,
        }
      }
    }

    return NextResponse.json({
      season: {
        current_season: season.season_number || 1,
        season_start: season.start_date,
        season_end: season.end_date,
        total_players: totalPlayers[0]?.count || 0,
        ...userStats,
      },
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch season stats" }, { status: 500 })
  }
}
