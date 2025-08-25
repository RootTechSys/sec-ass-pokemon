import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const tournaments = await query(`
      SELECT t.*, 
             COUNT(tp.user_id) as current_participants
      FROM tournaments t
      LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id
      WHERE t.status IN ('upcoming', 'active')
      GROUP BY t.id
      ORDER BY t.start_time ASC
    `)

    return NextResponse.json({ tournaments })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch tournaments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, entry_fee, prize_pool, max_participants, start_time, end_time, rounds } =
      await request.json()

    const result = await query(
      `
      INSERT INTO tournaments (name, description, entry_fee, prize_pool, max_participants, start_time, end_time, rounds, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'upcoming')
    `,
      [name, description, entry_fee, prize_pool, max_participants, start_time, end_time, rounds],
    )

    return NextResponse.json({
      success: true,
      tournament_id: result.insertId,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to create tournament" }, { status: 500 })
  }
}
