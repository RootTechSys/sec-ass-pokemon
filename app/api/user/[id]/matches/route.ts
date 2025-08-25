import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)

    const matches = await query(
      `
      SELECT tm.*, 
             u1.username as player1_name,
             u2.username as player2_name,
             t.name as tournament_name
      FROM tournament_matches tm
      INNER JOIN tournaments t ON tm.tournament_id = t.id
      INNER JOIN users u1 ON tm.player1_id = u1.id
      INNER JOIN users u2 ON tm.player2_id = u2.id
      WHERE tm.player1_id = ? OR tm.player2_id = ?
      ORDER BY tm.created_at DESC
    `,
      [userId, userId],
    )

    return NextResponse.json({ matches })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch user matches" }, { status: 500 })
  }
}
