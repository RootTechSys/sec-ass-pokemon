import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)

    const tournaments = await query(
      `
      SELECT t.*, COUNT(tp2.user_id) as current_participants
      FROM tournaments t
      INNER JOIN tournament_participants tp ON t.id = tp.tournament_id
      LEFT JOIN tournament_participants tp2 ON t.id = tp2.tournament_id
      WHERE tp.user_id = ?
      GROUP BY t.id
      ORDER BY t.start_time DESC
    `,
      [userId],
    )

    return NextResponse.json({ tournaments })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch user tournaments" }, { status: 500 })
  }
}
