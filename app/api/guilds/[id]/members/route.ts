import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const guildId = Number.parseInt(params.id)

    const members = await query(
      `
      SELECT gm.*, u.username, u.last_login as last_active
      FROM guild_members gm
      INNER JOIN users u ON gm.user_id = u.id
      WHERE gm.guild_id = ?
      ORDER BY 
        CASE gm.role 
          WHEN 'leader' THEN 1 
          WHEN 'officer' THEN 2 
          ELSE 3 
        END,
        gm.contribution_points DESC
    `,
      [guildId],
    )

    return NextResponse.json({ members })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch guild members" }, { status: 500 })
  }
}
