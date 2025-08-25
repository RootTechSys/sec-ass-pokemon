import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)

    const guild = await query(
      `
      SELECT g.*, 
             u.username as leader_name,
             COUNT(gm2.user_id) as member_count
      FROM guild_members gm
      INNER JOIN guilds g ON gm.guild_id = g.id
      INNER JOIN users u ON g.leader_id = u.id
      LEFT JOIN guild_members gm2 ON g.id = gm2.guild_id
      WHERE gm.user_id = ?
      GROUP BY g.id
    `,
      [userId],
    )

    return NextResponse.json({ guild: guild[0] || null })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch user guild" }, { status: 500 })
  }
}
