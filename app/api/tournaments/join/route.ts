import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { tournament_id, user_id } = await request.json()

    const tournament = await query(
      `
      SELECT t.*, COUNT(tp.user_id) as current_participants
      FROM tournaments t
      LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id
      WHERE t.id = ?
      GROUP BY t.id
    `,
      [tournament_id],
    )

    if (!tournament[0]) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 })
    }

    if (tournament[0].current_participants >= tournament[0].max_participants) {
      return NextResponse.json({ error: "Tournament is full" }, { status: 400 })
    }

    if (tournament[0].status !== "upcoming") {
      return NextResponse.json({ error: "Tournament is not accepting participants" }, { status: 400 })
    }

    const existingParticipant = await query(
      `
      SELECT id FROM tournament_participants 
      WHERE tournament_id = ? AND user_id = ?
    `,
      [tournament_id, user_id],
    )

    if (existingParticipant.length > 0) {
      return NextResponse.json({ error: "Already joined this tournament" }, { status: 400 })
    }

    const user = await query(
      `
      SELECT coins FROM users WHERE id = ?
    `,
      [user_id],
    )

    if (!user[0] || user[0].coins < tournament[0].entry_fee) {
      return NextResponse.json({ error: "Insufficient coins" }, { status: 400 })
    }

    await query(
      `
      INSERT INTO tournament_participants (tournament_id, user_id, joined_at)
      VALUES (?, ?, NOW())
    `,
      [tournament_id, user_id],
    )

    await query(
      `
      UPDATE users SET coins = coins - ? WHERE id = ?
    `,
      [tournament[0].entry_fee, user_id],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to join tournament" }, { status: 500 })
  }
}
