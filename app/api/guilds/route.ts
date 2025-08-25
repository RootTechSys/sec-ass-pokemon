import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const guilds = await query(`
      SELECT g.*, 
             u.username as leader_name,
             COUNT(gm.user_id) as member_count
      FROM guilds g
      INNER JOIN users u ON g.leader_id = u.id
      LEFT JOIN guild_members gm ON g.id = gm.guild_id
      WHERE g.is_public = 1
      GROUP BY g.id
      ORDER BY g.level DESC, g.experience DESC
    `)

    return NextResponse.json({ guilds })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch guilds" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, requirements, is_public, max_members, leader_id } = await request.json()

    const existingGuild = await query("SELECT id FROM guild_members WHERE user_id = ?", [leader_id])

    if (existingGuild.length > 0) {
      return NextResponse.json({ error: "User is already in a guild" }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO guilds (name, description, requirements, is_public, max_members, leader_id, level, experience)
       VALUES (?, ?, ?, ?, ?, ?, 1, 0)`,
      [name, description, requirements || null, is_public, max_members, leader_id],
    )

    await query(
      `INSERT INTO guild_members (guild_id, user_id, role, contribution_points)
       VALUES (?, ?, 'leader', 0)`,
      [result.insertId, leader_id],
    )

    return NextResponse.json({ success: true, guild_id: result.insertId })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to create guild" }, { status: 500 })
  }
}
